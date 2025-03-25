import { Box, Grid2, styled, Typography } from "@mui/material";
// import CarbonOffsetIcon from "../icons/carbon-offset.svg";
// import CottonTopMonkeysProtectedIcon from "../icons/community-income.svg";
// import HectaresProtectedIcon from "../icons/hectares-protected.svg";
// import TreesPlantedIcon from "../icons/trees-planted.svg";
import theme from "../theme";

const ImpactItemContainer = styled("div")`
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  width: 100%;
  margin-top: ${theme.spacing(2)};
  margin-bottom: ${theme.spacing(2)};
`;

const ImpactItemForPopupContainer = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 3px;
  margin-bottom: 3px;
`;

export type ImpactScoreProps = {
  totalHectares: number;
  cottonTopMonkeysProtected: number;
  treesPlanted: number;
  carbonOffset: number;
  owned?: boolean;
  isPopup?: boolean;
};

export default function ImpactScore({
  totalHectares,
  cottonTopMonkeysProtected,
  treesPlanted,
  carbonOffset,
  isPopup = false,
  owned = false,
}: ImpactScoreProps) {
  const Container = isPopup ? ImpactItemForPopupContainer : ImpactItemContainer;
  return (
    <section>
      <Container>
        <Grid2
          display="flex"
          alignItems="center"
          maxWidth={isPopup ? "100%" : "60%"}
        >
          {/* {isPopup && (
            <HectaresProtectedIcon
              style={{
                marginRight: "5.84px",
              }}
            />
          )} */}
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            {owned ? "Acres Protected" : "Acres Available"}
          </Typography>
        </Grid2>
        <Grid2 display="flex">
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            {totalHectares}
          </Typography>
          {/* {!isPopup && <HectaresProtectedIcon />} */}
        </Grid2>
      </Container>
      <Container>
        <Grid2
          display="flex"
          alignItems="center"
          maxWidth={isPopup ? "100%" : "60%"}
        >
          {/* {isPopup && (
            <CottonTopMonkeysProtectedIcon
              style={{
                marginRight: "5.84px",
              }}
            />
          )} */}
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            Income for local families(USD)
          </Typography>
        </Grid2>
        <Grid2 display="flex">
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            {cottonTopMonkeysProtected}
          </Typography>
          {/* {!isPopup && <CottonTopMonkeysProtectedIcon />} */}
        </Grid2>
      </Container>
      <Container>
        <Grid2
          display="flex"
          alignItems="center"
          maxWidth={isPopup ? "100%" : "60%"}
        >
          {/* {isPopup && (
            <Box>
              <TreesPlantedIcon />
            </Box>
          )} */}
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            Trees Planted
          </Typography>
        </Grid2>
        <Grid2 display="flex">
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            {treesPlanted}
          </Typography>
          {/* {!isPopup && <TreesPlantedIcon />} */}
        </Grid2>
      </Container>
      <Container>
        <Grid2
          display="flex"
          alignItems="center"
          maxWidth={isPopup ? "100%" : "60%"}
        >
          {/* {isPopup && (
            <CarbonOffsetIcon
              style={{
                marginRight: "5.84px",
              }}
            />
          )} */}
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            Carbon removed (in tons)
          </Typography>
        </Grid2>
        <Grid2 display="flex">
          <Typography variant="subtitle2" component="span" fontSize="0.75rem">
            {carbonOffset}
          </Typography>
          {/* {!isPopup && <CarbonOffsetIcon />} */}
        </Grid2>
      </Container>
    </section>
  );
}
