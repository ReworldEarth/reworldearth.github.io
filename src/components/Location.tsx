import { Wrapper } from "@googlemaps/react-wrapper";
import { Box, useMediaQuery } from "@mui/material";
import { JSX, useEffect, useState } from "react";
import useMap from "../hooks/useMap";
import { ContinentLocation, Donor, Hectare, LocationPageProps } from "../types";
import HectareInfoPopup from "./HectareInfoPopup";
import LeftPanel from "./LeftPanel";
import Legend from "./Legend";
import OwnedHectarePopup from "./OwnedHectarePopup";

export default function LocationPageLayout({
  continentLocation,
  donors,
}: LocationPageProps) {
  console.log(import.meta.env.VITE_GOOGLE_API_KEY);
  if (!import.meta.env.VITE_GOOGLE_API_KEY) {
    throw new Error("VITE_GOOGLE_API_KEY is not defined");
  }

  return (
    <Wrapper
      apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
      libraries={["geometry"]}
    >
      <Map continentLocation={continentLocation} donors={donors} />
    </Wrapper>
  );
}

interface MapProps extends google.maps.MapOptions {
  style?: { [key: string]: string };
  continentLocation: ContinentLocation;
  donors: Donor[];
}

function Map({ style, continentLocation, donors }: MapProps): JSX.Element {
  const [, setSelectedAcres] = useState<Hectare[]>([]);
  const [deletedEntireAcre] = useState<Hectare | undefined>(undefined);
  const [selectedPartialAcres, setSelectedPartialAcres] = useState<Hectare[]>(
    []
  );
  const [, setTotalHectaresSelected] = useState<number>(0);
  const isMobile = useMediaQuery("(max-width:480px)");

  const {
    ref,
    activeHectare,
    selectedAcreIds,
    ownedHectarePopup,
    hectareInfoPopup,
    disableBackdrop,
    handleCloseCart,
    handleOpenCart,
    cartOpened,
    cartItems,
  } = useMap({
    kmlUrl: continentLocation.kmlFile.url,
    hectares: continentLocation.continentLocationHectares,
    donors: donors,
    selectedPartialAcres: selectedPartialAcres,
    deletedEntireAcre: deletedEntireAcre,
  });

  useEffect(() => {
    const acresList = continentLocation.continentLocationHectares;
    const _selectedAcres = acresList.filter(
      (acre) =>
        selectedAcreIds.includes(acre.orderNumber) &&
        acre.hectareType === "entire"
    );
    const selectedPartialAcres = acresList.filter(
      (acre) =>
        selectedAcreIds.includes(acre.orderNumber) &&
        acre.hectareType === "partial"
    );
    setSelectedAcres(_selectedAcres);
    setSelectedPartialAcres(selectedPartialAcres);

    let ths = _selectedAcres.length;
    let pths = selectedPartialAcres
      .map((item) =>
        item.hectareOwnerships.length > 0
          ? item.hectareOwnerships
              .map((hc) => hc?.fractions / 100)
              .reduce((curr, prev) => curr + prev, 0)
          : 1 / 100
      )
      .reduce((curr, prev) => curr + prev, 0);
    ths = ths + pths;
    setTotalHectaresSelected(ths);
  }, [selectedAcreIds]);

  return (
    <Box position="relative" width={"100%"} height={"100%"}>
      <div
        ref={ref}
        id="map"
        style={{ ...style, width: "100%", height: "100%" }}
      />
      <Legend />
      <LeftPanel
        isOpen={cartOpened}
        disableBackdrop={disableBackdrop}
        onClose={handleCloseCart}
        onOpen={handleOpenCart}
        activeHectare={activeHectare}
        continentLocation={continentLocation}
      />

      {ownedHectarePopup && !isMobile && (
        <OwnedHectarePopup
          key={ownedHectarePopup.hectare.orderNumber}
          popup={ownedHectarePopup}
          continentLocation={continentLocation}
        />
      )}
      {hectareInfoPopup && !isMobile && (
        <HectareInfoPopup
          key={hectareInfoPopup.hectare.orderNumber}
          popup={hectareInfoPopup}
          continentLocation={continentLocation}
          items={cartItems}
        />
      )}
    </Box>
  );
}
