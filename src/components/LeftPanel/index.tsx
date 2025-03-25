import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Divider,
  IconButton,
  styled,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ContinentLocation, Hectare } from "../../types";
import ImpactScore from "../ImpactScore";
import styles from "./styles.module.scss";

type LeftPanelProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeHectare?: Hectare;
  continentLocation: ContinentLocation;
  disableBackdrop: boolean;
};

const PanelHeading = styled(Typography)`
  font-weight: 700;
  font-size: 14px;
  line-height: 120%;
`;

const CloseButton = styled(IconButton)`
  width: 10px;
  height: 10px;
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
`;

const SubHeading = styled(Typography)`
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 120%;
  color: #081c3a;
  margin-bottom: 9px;
`;

const QuoteText = styled(Typography)`
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 120%;
  color: #081c3a;
`;

const getDonorImage = (activeHectare: Hectare | undefined) => {
  const donorImage = activeHectare?.hectareOwnerships?.[0]?.donor?.image;
  if (Array.isArray(donorImage) && donorImage.length > 0) {
    return donorImage[0]?.url;
  }
  return "/images/avatar.png";
};

export default function LeftPanel(props: LeftPanelProps) {
  const {
    isOpen,
    onOpen,
    onClose,
    activeHectare,
    continentLocation,
    disableBackdrop,
  } = props;

  const isMobile = useMediaQuery("(max-width:480px)");

  const hasHectareOwnerships = activeHectare?.hectareOwnerships?.length;

  const renderDonorImage = () => (
    <Box
      position="relative"
      width="48px"
      height="48px"
      marginRight={2}
      className={styles.avatar}
    >
      <img
        src={getDonorImage(activeHectare)}
        alt="Owner Avatar"
        style={{
          objectFit: "cover",
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
        }}
      />
    </Box>
  );

  const renderHectareOwnerships = () => {
    if (hasHectareOwnerships) {
      return activeHectare?.hectareOwnerships.map((owner) => {
        const count = activeHectare.acreCount || 1;
        const totalHectaresImpacted = (owner.fractions / 100) * count;
        return (
          <Box key={owner.donor.id}>
            <CloseButton onClick={() => onClose()}>
              <CloseIcon />
            </CloseButton>
            <section>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "50px",
                }}
              >
                {renderDonorImage()}
                <PanelHeading variant="h3">{owner.donor.name}</PanelHeading>
              </Box>
              <Box mt={1}>
                <Divider></Divider>
              </Box>
              <Box mt={2} mb={2}>
                <ImpactScore
                  totalHectares={totalHectaresImpacted}
                  cottonTopMonkeysProtected={Math.ceil(
                    (continentLocation.cottonTopMonkeysSaved /
                      continentLocation.totalHectares) *
                      totalHectaresImpacted *
                      1.0
                  )}
                  treesPlanted={Math.ceil(
                    (continentLocation.treesPlantedOrSaved /
                      continentLocation.totalHectares) *
                      totalHectaresImpacted *
                      1.0
                  )}
                  carbonOffset={
                    +(
                      (continentLocation.annualCarbonOffset /
                        continentLocation.totalHectares) *
                      totalHectaresImpacted *
                      1.0
                    ).toFixed(2)
                  }
                  isPopup={true}
                  owned
                />
              </Box>
              <Divider></Divider>
              {owner.donor.bio && (
                <Box marginBottom={2.5} marginTop={2} width="100%">
                  <SubHeading variant="h3">
                    {owner.donor.about || owner.donor.name}
                  </SubHeading>
                  <QuoteText variant="h6">{owner.donor.bio}</QuoteText>
                </Box>
              )}
            </section>
          </Box>
        );
      });
    }
  };

  return (
    <SwipeableDrawer
      open={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      anchor="left"
      hideBackdrop={disableBackdrop}
      slotProps={{
        paper: {
          sx: {
            position: "absolute",
            top: "49px",
            left: isMobile ? "20px" : "24px",
            borderRadius: "10px",
            height: "80vh",
            overflowY: "scroll",
            padding: "2rem",
            width: isMobile ? "90%" : "410px",
          },
        },
      }}
    >
      {activeHectare &&
      activeHectare.hectareOwnerships &&
      activeHectare.hectareOwnerships.length > 0
        ? renderHectareOwnerships()
        : null}
    </SwipeableDrawer>
  );
}
