import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import colors from "../theme/colors";
import { Donor, Hectare } from "../types";

// @todo: Extract cart logic to separate hook

export type CartItem = {
  hectare: Hectare;
  percentage?: number; // If hectare type - entire - we don't need this percentage
};

export type OwnedHectarePopupMetadata = {
  hectare: Hectare;
  position: {
    clientX: number;
    clientY: number;
  };
};

export type HectarePopupMetadata = {
  hectare: Hectare;
  position: {
    clientX: number;
    clientY: number;
  };
  items: CartItem[];
};

export default function useMap({
  kmlUrl,
  hectares,
  donors,
  selectedPartialAcres,
  deletedEntireAcre,
}: {
  kmlUrl: string;
  hectares: Hectare[];
  donors: Donor[];
  selectedPartialAcres: Hectare[];
  deletedEntireAcre: Hectare | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [kmlLayer, setKmlLayer] = useState<google.maps.KmlLayer>();
  const [rectangles, setRectangles] = useState<google.maps.Rectangle[]>([]);
  const [activeHectare, setActiveHectare] = useState<Hectare | undefined>();
  const [cartOpened, setCartOpened] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAcreIds, setSelectedAcreIds] = useState<number[]>([]);
  const [selectedPartialAcre, setSelectedPartialAcre] = useState<
    Hectare | undefined
  >();
  const [ownedHectarePopup, setOwnedHectarePopup] =
    useState<OwnedHectarePopupMetadata | null>(null);
  const [hectareInfoPopup, setHectareInfoPopup] =
    useState<OwnedHectarePopupMetadata | null>(null);
  const activeRectangle = useRef<google.maps.Rectangle>(); // Have to use ref due to closures
  const [prevPartialRectangle, setPrevPartialRectangle] =
    useState<google.maps.Rectangle>();
  const [disableBackdrop, setDisableBackdrop] = useState<boolean>(false);
  const [hoveredOwnedHectare, setHoveredOwnedHectare] = useState<
    Hectare | undefined
  >();

  const isPopupVisible = useCallback(
    (
      popupState: OwnedHectarePopupMetadata | null,
      popup: OwnedHectarePopupMetadata
    ) => {
      return (
        popupState &&
        popupState.hectare.orderNumber === popup.hectare.orderNumber
      );
    },
    []
  );

  const isInfoPopupVisible = useCallback(
    (
      popupState: OwnedHectarePopupMetadata | null,
      popup: OwnedHectarePopupMetadata
    ) => {
      return (
        popupState &&
        popupState.hectare.orderNumber === popup.hectare.orderNumber
      );
    },
    []
  );

  const hasSelectedAcre = useCallback(
    (popupState: number[], orderNumber: number) => {
      return !!popupState.includes(orderNumber);
    },
    []
  );

  const showPopup = useCallback(
    (popup: OwnedHectarePopupMetadata) => {
      setHectareInfoPopup(null);
      setOwnedHectarePopup((prevState) => {
        if (!isPopupVisible(prevState, popup)) {
          return popup;
        }
        return prevState;
      });
    },
    [isPopupVisible]
  );

  const showInfoPopup = useCallback(
    (popup: OwnedHectarePopupMetadata) => {
      setOwnedHectarePopup(null);
      setHectareInfoPopup((prevState) => {
        if (!isInfoPopupVisible(prevState, popup)) {
          return popup;
        }
        return prevState;
      });
    },
    [isInfoPopupVisible]
  );

  // We need this Debounce to prevent hiding Popup. And React is not happy with that
  // So adding eslint ignore for this function
  // eslint-disable-next-line
  const hidePopup = useCallback(
    debounce((popup: OwnedHectarePopupMetadata) => {
      setOwnedHectarePopup((prevState) => {
        if (isPopupVisible(prevState, popup)) {
          return null;
        }
        return prevState;
      });
    }, 30),
    [isPopupVisible]
  );

  const hideInfoPopup = useCallback(
    debounce((popup: OwnedHectarePopupMetadata) => {
      setHectareInfoPopup((prevState) => {
        if (isInfoPopupVisible(prevState, popup)) {
          return null;
        }
        return prevState;
      });
    }, 0),
    [isInfoPopupVisible]
  );

  const handleHectareClick = useCallback(
    (hectare: Hectare, rectangle: google.maps.Rectangle) => {
      const percentsOwned =
        hectare.hectareOwnerships
          ?.map((owner) => owner.fractions)
          .reduce((prev, curr) => prev + curr, 0) || 0;
      setSelectedAcreIds((prevState) => {
        if (hasSelectedAcre(prevState, hectare.orderNumber)) {
          const fillColor = getRectangleFillColor(hectare, "default");
          const splittedColor = fillColor.split(")");
          const strokeColor =
            splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
          rectangle.setOptions({
            fillOpacity:
              hectare.hectareType === "partial" && percentsOwned > 0
                ? 0.5
                : 0.3,
            fillColor,
            strokeColor,
          });
          activeRectangle.current = rectangle;
          const filteredArray = prevState.filter(
            (id) => id !== hectare.orderNumber
          );
          return [...filteredArray];
        } else {
          if (hectare.hectareType === "partial") {
            const prevPartialHectare = hectares.find(
              (hec) =>
                hec.hectareType === "partial" &&
                prevState.includes(hec.orderNumber)
            );
            if (prevPartialHectare) {
              setPrevPartialRectangle((prev) => {
                // Remove previous selected partial Hectare and select new one
                const prev_color = getRectangleFillColor(
                  prevPartialHectare,
                  "default"
                );
                const prev_splittedColor = prev_color.split(")");
                const prev_strokeColor =
                  prev_splittedColor.length > 0
                    ? `${prev_splittedColor[0]}, 0.5)`
                    : "white";
                const percOwned =
                  prevPartialHectare.hectareOwnerships
                    ?.map((owner) => owner.fractions)
                    .reduce((prev, curr) => prev + curr, 0) || 0;
                prev?.setOptions({
                  fillOpacity:
                    prevPartialHectare.hectareType === "partial" &&
                    percOwned > 0
                      ? 0.5
                      : 0.3,
                  fillColor: prev_color,
                  strokeColor: prev_strokeColor,
                });

                // Add new Partial Acre
                const fillColor = getRectangleFillColor(
                  prevPartialHectare,
                  "selected"
                );
                const splittedColor = fillColor.split(")");
                const strokeColor =
                  splittedColor.length > 0
                    ? `${splittedColor[0]}, 0.5)`
                    : "white";
                rectangle.setOptions({
                  fillOpacity: 0.8,
                  fillColor,
                  strokeColor,
                });
                activeRectangle.current = rectangle;
                return activeRectangle.current;
              });

              const updatedState = prevState.filter(
                (hecId) => prevPartialHectare.orderNumber !== hecId
              );
              return [...updatedState, hectare.orderNumber];
            } else {
              const fillColor = getRectangleFillColor(hectare, "selected");
              const splittedColor = fillColor.split(")");
              const strokeColor =
                splittedColor.length > 0
                  ? `${splittedColor[0]}, 0.5)`
                  : "white";
              rectangle.setOptions({
                fillOpacity: 0.8,
                fillColor,
                strokeColor,
              });
              activeRectangle.current = rectangle;
              setPrevPartialRectangle(activeRectangle.current);
              return [...prevState, hectare.orderNumber];
            }
          } else {
            const fillColor = getRectangleFillColor(hectare, "selected");
            const splittedColor = fillColor.split(")");
            const strokeColor =
              splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
            rectangle.setOptions({ fillOpacity: 0.8, fillColor, strokeColor });
            activeRectangle.current = rectangle;
            return [...prevState, hectare.orderNumber];
          }
        }
      });
    },
    [hasSelectedAcre, setPrevPartialRectangle]
  );

  const onOpenPanel = () => {
    setCartOpened(true);
  };

  const handleOwnedHectareClick = useCallback(
    (hectare: Hectare, rectangle: google.maps.Rectangle) => {
      const fillColor = getRectangleFillColor(hectare, "selected");
      const splittedColor = fillColor.split(")");
      const strokeColor =
        splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
      rectangle.setOptions({ fillOpacity: 0.3, fillColor, strokeColor });
      let _hectare = hectare;
      const hactarDonorIds = _hectare?.hectareOwnerships.map(
        (ho) => ho.donor.id
      );
      const donorOwnership = donors.find((donor) =>
        hactarDonorIds.find((did) => did === donor.id)
      );
      if (donorOwnership && donorOwnership.hectareOwnerships) {
        const updatedHectareOwnerships = _hectare?.hectareOwnerships.map(
          (ho) => {
            return {
              ...ho,
              donor: {
                ...ho.donor,
                bio: donorOwnership?.bio,
                image: donorOwnership?.image,
                about: donorOwnership?.about,
              },
            };
          }
        );
        if (updatedHectareOwnerships && updatedHectareOwnerships.length > 0) {
          _hectare = {
            ..._hectare,
            hectareOwnerships: updatedHectareOwnerships,
          };
        }
      }
      setActiveHectare(_hectare);
      onOpenPanel();
      // setCartOpened(true);
      activeRectangle.current = rectangle;
    },
    []
  );

  const getRectByHectareBounds = (
    rectangleList: google.maps.Rectangle[],
    northEast: any,
    southWest: any
  ) => {
    const rectangle = rectangleList.find((rect) => {
      const bounds = rect.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        if (
          ne.lat() == northEast[0] &&
          ne.lng() == northEast[1] &&
          sw.lat() == southWest[0] &&
          sw.lng() == southWest[1]
        ) {
          return true;
        } else {
          return false;
        }
      }
    });
    return rectangle;
  };

  // We're using useCallback to guarantee that function will remain the same across renders
  // This is needed to prevent flashing of visual effects and reassignment of event listeners
  const handleMouseOverOwnedHectare = useCallback(
    (
      event: google.maps.MapMouseEvent,
      hectare: Hectare,
      rectangle: google.maps.Rectangle
    ) => {
      setHoveredOwnedHectare((prevHec) => {
        if (prevHec && prevHec.orderNumber !== hectare.orderNumber) {
          prevHec?.hectareOwnerships.forEach((ho) => {
            const orderIds = ho.donor.orderIds;
            if (
              orderIds &&
              orderIds.length > 0 &&
              !orderIds.includes(hectare.orderNumber)
            ) {
              const ownedHectarsByDonor = hectares.filter((h) =>
                orderIds.includes(h.orderNumber)
              );
              ownedHectarsByDonor.forEach((ohbd) => {
                let southWest = ohbd.boundings.southWest
                  .split(",")
                  .map((coordinate) =>
                    Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
                  );
                let northEast = ohbd.boundings.northEast
                  .split(",")
                  .map((coordinate) =>
                    Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
                  );
                const fillColor = getRectangleFillColor(ohbd, "default");
                const percentsOwned =
                  prevHec.hectareOwnerships
                    ?.map((owner) => owner.fractions)
                    .reduce((prev, curr) => prev + curr, 0) || 0;
                setRectangles((prevRects) => {
                  const rect = getRectByHectareBounds(
                    prevRects,
                    northEast,
                    southWest
                  );
                  if (rect) {
                    rect?.setOptions({
                      fillOpacity:
                        prevHec.hectareType === "partial" && percentsOwned > 0
                          ? 0.5
                          : 0.3,
                      fillColor,
                      strokeWeight: 0,
                    });
                    activeRectangle.current = rect;
                    return [...prevRects, rect];
                  } else {
                    return prevRects;
                  }
                });
              });
            }
          });
        } else {
          return prevHec;
        }
      });
      setHoveredOwnedHectare(hectare);
      hectare?.hectareOwnerships.forEach((ho) => {
        const orderIds = ho.donor.orderIds;
        if (orderIds) {
          const ownedHectarsByDonor = hectares.filter((h) =>
            orderIds.includes(h.orderNumber)
          );
          ownedHectarsByDonor.forEach((ohbd) => {
            let southWest = ohbd.boundings.southWest
              .split(",")
              .map((coordinate) =>
                Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
              );
            let northEast = ohbd.boundings.northEast
              .split(",")
              .map((coordinate) =>
                Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
              );
            const fillColor = getRectangleFillColor(ohbd, "selected");
            setRectangles((prevRects) => {
              const rect = getRectByHectareBounds(
                prevRects,
                northEast,
                southWest
              );
              if (rect) {
                rect?.setOptions({
                  fillOpacity: 0.8,
                  fillColor,
                  strokeWeight: 0,
                });
                activeRectangle.current = rect;
                return [...prevRects, rect];
              } else {
                return prevRects;
              }
            });
          });
        }
      });

      const domEvent = event.domEvent as MouseEvent;
      showPopup({
        hectare: {
          ...hectare,
        },
        position: {
          clientX: domEvent.clientX - 80,
          clientY: domEvent.clientY - 65,
        },
      });
    },
    [selectedAcreIds] // eslint-disable-line
  );

  const handleMouseOutOwnedHectare = useCallback(
    (
      event: google.maps.PolyMouseEvent,
      hectare: Hectare,
      rectangle: google.maps.Rectangle
    ) => {
      hidePopup({
        hectare,
        position: {
          clientX: 0,
          clientY: 0,
        },
      });
    },
    [selectedAcreIds] // eslint-disable-line
  );

  const handleMouseOverHectareInfo = useCallback(
    (
      event: google.maps.MapMouseEvent,
      hectare: Hectare,
      rectangle: google.maps.Rectangle
    ) => {
      // setActiveHectare(hectare);
      // handleAddHectareToCart(100);
      setHoveredOwnedHectare((prevHoveredAcre) => {
        if (prevHoveredAcre) {
          prevHoveredAcre?.hectareOwnerships.forEach((ho) => {
            const orderIds = ho.donor.orderIds;
            if (orderIds) {
              const ownedHectarsByDonor = hectares.filter((h) =>
                orderIds.includes(h.orderNumber)
              );
              ownedHectarsByDonor.forEach((ohbd) => {
                let southWest = ohbd.boundings.southWest
                  .split(",")
                  .map((coordinate) =>
                    Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
                  );
                let northEast = ohbd.boundings.northEast
                  .split(",")
                  .map((coordinate) =>
                    Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
                  );
                const fillColor = getRectangleFillColor(ohbd, "default");
                setRectangles((prevRects) => {
                  const rect = getRectByHectareBounds(
                    prevRects,
                    northEast,
                    southWest
                  );
                  if (rect) {
                    rect?.setOptions({
                      fillOpacity: 0.3,
                      fillColor,
                      strokeWeight: 0,
                    });
                    activeRectangle.current = rect;
                    return [...prevRects, rect];
                  } else {
                    return prevRects;
                  }
                });
              });
            }
          });
        }
        return undefined;
      });

      setSelectedAcreIds((prevState) => {
        if (!hasSelectedAcre(prevState, hectare.orderNumber)) {
          const fillColor = getRectangleFillColor(hectare, "selected");
          const splittedColor = fillColor.split(")");
          const strokeColor =
            splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
          rectangle.setOptions({ fillOpacity: 0.95, fillColor, strokeColor });
        }
        return prevState;
      });
      const domEvent = event.domEvent as MouseEvent;
      showInfoPopup({
        hectare,
        position: {
          clientX: domEvent.clientX - 80,
          clientY: domEvent.clientY - 65,
        },
      });
    },
    [selectedAcreIds, hasSelectedAcre] // eslint-disable-line
  );

  const handleMouseOutHectareInfo = useCallback(
    (
      event: google.maps.PolyMouseEvent,
      hectare: Hectare,
      rectangle: google.maps.Rectangle
    ) => {
      setSelectedAcreIds((prevState) => {
        if (!hasSelectedAcre(prevState, hectare.orderNumber)) {
          const percentsOwned =
            hectare.hectareOwnerships
              ?.map((owner) => owner.fractions)
              .reduce((prev, curr) => prev + curr, 0) || 0;
          const fillColor = getRectangleFillColor(hectare, "default");
          const splittedColor = fillColor.split(")");
          const strokeColor =
            splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
          rectangle.setOptions({
            fillOpacity:
              hectare.hectareType === "partial" && percentsOwned > 0
                ? 0.5
                : 0.3,
            fillColor,
            strokeColor,
          });
        }
        return prevState;
      });
      hideInfoPopup({
        hectare,
        position: {
          clientX: 0,
          clientY: 0,
        },
      });
    },
    [selectedAcreIds, hasSelectedAcre] // eslint-disable-line
  );

  const handleAddHectareToCart = (percentage?: number) => {
    if (activeHectare && !isHectareInCart(activeHectare)) {
      setActiveHectare(undefined);
      setCartItems((prevState) => [
        ...prevState,
        { hectare: activeHectare, percentage },
      ]);
    }
  };

  const handleRemoveHectareFromCart = (itemToRemove: CartItem) => {
    setCartItems((prevState) =>
      prevState.filter(
        (item) => item.hectare.orderNumber !== itemToRemove.hectare.orderNumber
      )
    );
  };

  const isHectareInCart = (hectare: Hectare) => {
    return !!cartItems.find(
      (item) => item.hectare.orderNumber === hectare.orderNumber
    );
  };

  const handleOpenCart = () => {
    setCartOpened(true);
  };

  const getRectangleFillColor = (
    hectare: Hectare,
    state: "default" | "selected"
  ) => {
    const palette =
      state === "default"
        ? colors.background.hectares
        : colors.background.hectares.selected;
    const percentsOwned =
      hectare.hectareOwnerships
        ?.map((owner) => owner.fractions)
        .reduce((prev, curr) => prev + curr, 0) || 0;
    const fillColor =
      percentsOwned === 100
        ? palette.owned
        : hectare.hectareType === "entire"
        ? palette.full
        : palette.partial;
    return fillColor;
  };

  const handleCloseCart = () => {
    setCartOpened(false);
    if (activeRectangle && activeHectare) {
      const color = getRectangleFillColor(activeHectare, "default");
      const splittedColor = color.split(")");
      const strokeColor =
        splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
      activeRectangle.current?.setOptions({
        strokeColor,
        fillOpacity: 0.3,
        fillColor: color,
      });
      setActiveHectare(undefined);
      activeRectangle.current = undefined;
    }
  };

  const drawHectares = useCallback(
    (rectangles: google.maps.Rectangle[]) => {
      if (map) {
        rectangles.forEach((rectangle) => {
          rectangle?.setMap(null);
        });
        const _rectangles: google.maps.Rectangle[] = [];
        hectares.forEach((hectare) => {
          let isOwnedAcre = false;
          const hactarDonorIds = hectare?.hectareOwnerships.map(
            (ho) => ho.donor.id
          );
          const donorOwnershipList = donors.filter((donor) =>
            hactarDonorIds.find((did) => did === donor.id)
          );

          if (donorOwnershipList.length > 0) {
            const orderIds = donorOwnershipList.flatMap((item) =>
              item.hectareOwnerships?.map(
                (hos: any) => hos?.hectare.orderNumber
              )
            );
            const orders = hectares.filter((h) =>
              orderIds?.includes(h.orderNumber)
            );
            let totalAcres = 0;
            for (let order of orders) {
              totalAcres += order.hectareOwnerships[0].fractions / 100;
            }
            const updatedHectareOwnerships = hectare?.hectareOwnerships.map(
              (ho) => {
                const did = ho.donor.id;
                const donorOwnership = donorOwnershipList.find(
                  (item) => item.id === did
                );
                return {
                  ...ho,
                  donor: {
                    ...ho.donor,
                    bio: donorOwnership?.bio,
                    image: donorOwnership?.image,
                    about: donorOwnership?.about,
                    orderIds,
                  },
                };
              }
            );
            if (
              updatedHectareOwnerships &&
              updatedHectareOwnerships.length > 0
            ) {
              isOwnedAcre = true;
              hectare = {
                ...hectare,
                acreCount: totalAcres,
                hectareOwnerships: updatedHectareOwnerships,
              };
            }
          }
          const southWest = hectare.boundings.southWest
            .split(",")
            .map((coordinate) =>
              Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
            );
          const northEast = hectare.boundings.northEast
            .split(",")
            .map((coordinate) =>
              Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
            );
          const rectangleBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(southWest[0], southWest[1]),
            new google.maps.LatLng(northEast[0], northEast[1])
          );
          const percentsOwned =
            hectare.hectareOwnerships
              ?.map((owner) => owner.fractions)
              .reduce((prev, curr) => prev + curr, 0) || 0;

          const color = getRectangleFillColor(hectare, "default");
          const splittedColor = color.split(")");
          const strokeColor =
            splittedColor.length > 0 ? `${splittedColor[0]}, 0.5)` : "white";
          const rectangle = new google.maps.Rectangle({
            strokeColor,
            strokeWeight: isOwnedAcre ? 0 : 1,
            fillColor: color,
            fillOpacity:
              hectare.hectareType === "partial" && percentsOwned > 0
                ? 0.5
                : 0.3,
            map,
            bounds: rectangleBounds,
            draggable: false,
          });

          if (percentsOwned < 100) {
            rectangle.addListener("click", () =>
              handleHectareClick(hectare, rectangle)
            );
            rectangle.addListener(
              "mouseover",
              (e: google.maps.PolyMouseEvent) =>
                handleMouseOverHectareInfo(e, hectare, rectangle)
            );
            rectangle.addListener("mouseout", (e: google.maps.PolyMouseEvent) =>
              handleMouseOutHectareInfo(e, hectare, rectangle)
            );
          } else {
            rectangle.addListener("click", () =>
              handleOwnedHectareClick(hectare, rectangle)
            );
            rectangle.addListener(
              "mouseover",
              (e: google.maps.PolyMouseEvent) =>
                handleMouseOverOwnedHectare(e, hectare, rectangle)
            );
            rectangle.addListener("mouseout", (e: google.maps.PolyMouseEvent) =>
              handleMouseOutOwnedHectare(e, hectare, rectangle)
            );
          }
          _rectangles.push(rectangle);
        });
        setRectangles(_rectangles);
      }
    },
    [hectares, map]
  );

  useEffect(() => {
    async function initMap() {
      if (ref.current && !map) {
        const newMap = new google.maps.Map(ref.current, {
          mapTypeId: "satellite",
          fullscreenControl: false,
        });
        const newKmlLayer = new google.maps.KmlLayer({
          suppressInfoWindows: true,
          preserveViewport: false,
          map: newMap,
          url: kmlUrl,
        });
        setMap(newMap);
        setKmlLayer(newKmlLayer);
      }
    }
    initMap();
  }, [map, kmlUrl]);

  useEffect(() => {
    drawHectares(rectangles);

    if (map) {
      setTimeout(
        () => {
          map.setZoom(15.5);
        }
        // isMobile ? 800 : 500
      );
      // if (firstOrderNumber) {
      //   const foundHectare = hectares.find(
      //     (hc) => hc.orderNumber === firstOrderNumber
      //   );
      //   if (foundHectare) {
      //     let center = foundHectare.boundings.center
      //       .split(",")
      //       .map((coordinate) =>
      //         Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
      //       );

      //     const rectangleBounds = new google.maps.LatLngBounds(
      //       new google.maps.LatLng(center[0], center[1])
      //     );

      //     setRectangles((rects) => {
      //       const rectangle = rects.find((rect) => {
      //         const bounds = rect.getBounds();
      //         if (bounds) {
      //           const rectCenter = bounds.getCenter();
      //           return rectCenter.equals(rectangleBounds.getCenter());
      //         }
      //       });

      //       setTimeout(() => {
      //         map.setCenter(rectangleBounds.getCenter());
      //         map.setZoom(18);

      //         if (rectangle) {
      //           setSelectedAcreIds((prevState) => {
      //             const fillColor = getRectangleFillColor(
      //               foundHectare,
      //               "selected"
      //             );
      //             const splittedColor = fillColor.split(")");
      //             const strokeColor =
      //               splittedColor.length > 0
      //                 ? `${splittedColor[0]}, 0.5)`
      //                 : "white";
      //             rectangle.setOptions({
      //               fillOpacity: 0.8,
      //               fillColor,
      //               strokeColor,
      //             });
      //             activeRectangle.current = rectangle;
      //             setPrevPartialRectangle(activeRectangle.current);
      //             return [...prevState, foundHectare.orderNumber];
      //           });
      //         }
      //       }, 1000);
      //       return rects;
      //     });
      //   }
      // }
    }
    // eslint-disable-next-line
    // }, [map, hectares, drawHectares, firstOrderNumber]);
  }, [map, hectares, drawHectares]);

  useEffect(() => {
    if (selectedPartialAcres.length === 0) {
      // Remove previous selected partial Hectare and select new one
      const prevPartialHectare = hectares.find(
        (hec) =>
          hec.hectareType === "partial" &&
          selectedAcreIds.includes(hec.orderNumber)
      );
      if (prevPartialHectare) {
        const percentsOwned =
          prevPartialHectare.hectareOwnerships
            .filter((spa) => spa.donor.id !== "1001")
            .map((owner) => owner.fractions)
            .reduce((prev, curr) => prev + curr, 0) || 0;
        const prev_color = getRectangleFillColor(prevPartialHectare, "default");
        const prev_splittedColor = prev_color.split(")");
        const prev_strokeColor =
          prev_splittedColor.length > 0
            ? `${prev_splittedColor[0]}, 0.5)`
            : "white";
        prevPartialRectangle?.setOptions({
          fillOpacity:
            prevPartialHectare.hectareType === "partial" && percentsOwned > 0
              ? 0.5
              : 0.3,
          fillColor: prev_color,
          strokeColor: prev_strokeColor,
        });
        setPrevPartialRectangle(undefined);
      }
    }
  }, [selectedPartialAcres]);

  useEffect(() => {
    // Remove previous selected entire Hectare and select new one

    if (deletedEntireAcre) {
      const fillColor = getRectangleFillColor(deletedEntireAcre, "default");
      const prev_splittedColor = fillColor.split(")");
      const strokeColor =
        prev_splittedColor.length > 0
          ? `${prev_splittedColor[0]}, 0.5)`
          : "white";

      let southWest = deletedEntireAcre.boundings.southWest
        .split(",")
        .map((coordinate) =>
          Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
        );
      let northEast = deletedEntireAcre.boundings.northEast
        .split(",")
        .map((coordinate) =>
          Number(coordinate.replaceAll("(", "").replaceAll(")", ""))
        );

      setRectangles((prevRects) => {
        const rectangle = prevRects.find((rect) => {
          const bounds = rect.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            if (
              ne.lat() == northEast[0] &&
              ne.lng() == northEast[1] &&
              sw.lat() == southWest[0] &&
              sw.lng() == southWest[1]
            ) {
              return true;
            } else {
              return false;
            }
          }
        });

        if (rectangle) {
          rectangle.setOptions({ fillOpacity: 0.3, fillColor, strokeColor });
          activeRectangle.current = rectangle;
          return [...prevRects, rectangle];
        } else {
          return prevRects;
        }
      });
      setSelectedAcreIds((prevState) => {
        const filteredArray = prevState.filter(
          (id) => id !== deletedEntireAcre.orderNumber
        );
        return filteredArray;
      });
    }
  }, [deletedEntireAcre]);

  return {
    ref,
    kmlLayer,
    map,
    activeHectare,
    setActiveHectare,
    cartOpened,
    setLeftPanelOpened: setCartOpened,
    cartItems,
    selectedAcreIds,
    ownedHectarePopup,
    hectareInfoPopup,
    handleAddHectareToCart,
    handleRemoveHectareFromCart,
    handleOpenCart,
    handleCloseCart,
    disableBackdrop,
  };
}
