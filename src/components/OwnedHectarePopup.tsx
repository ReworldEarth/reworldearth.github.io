import { Box, Divider, Paper, styled, Typography } from "@mui/material";
import { OwnedHectarePopupMetadata } from "../hooks/useMap";
import theme from "../theme";
import { ContinentLocation } from "../types";
import ImpactScore from "./ImpactScore";
import { calculatePositionX, calculatePositionY } from "../utils";

const PopupWrapper = styled(Paper)`
  position: absolute;
  padding: ${theme.spacing(1.5)} ${theme.spacing(1.75)};
  width: 255px;
`;

const BioText = styled(Typography)`
  margin-top: 5px;
  font-weight: 600;
  font-size: 10px;
  line-height: 120%;
  color: #081c3a;
`;

export default function OwnedHectarePopup({
  popup: { position, hectare },
  continentLocation,
}: {
  popup: OwnedHectarePopupMetadata;
  continentLocation: ContinentLocation;
}) {
  return (
    <PopupWrapper
      style={{
        top: calculatePositionY(position.clientY),
        left: calculatePositionX(position.clientX),
      }}
    >
      <Typography variant="h4">
        {hectare.hectareOwnerships?.map((owner) => {
          const count = hectare.acreCount || 1;
          const totalHectaresImpacted = (owner.fractions / 100) * count;
          return (
            <section key={owner.donor.name}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <Typography sx={{ marginBottom: "0" }} fontWeight="bold">
                  {owner.donor.name}
                </Typography>
              </Box>

              <Divider></Divider>
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

              <Divider></Divider>
              {owner.donor.bio && <BioText>{owner.donor.bio}</BioText>}
            </section>
          );
        })}
      </Typography>
    </PopupWrapper>
  );
}
