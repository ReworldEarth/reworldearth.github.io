import { Box, Divider, Paper, styled, Typography } from "@mui/material";
import { CartItem, OwnedHectarePopupMetadata } from "../hooks/useMap";
import theme from "../theme";
import { ContinentLocation } from "../types";
import ImpactScore from "./ImpactScore";
import { calculatePositionX, calculatePositionY } from "../utils";

const PopupWrapper = styled(Paper)`
  position: absolute;
  padding: ${theme.spacing(1.5)} ${theme.spacing(1.75)};
  width: 255px;
  background: #ffffff;
  border-radius: 12px;
`;

const PriceText = styled(Typography)`
  color: #32727a;
  margin-bottom: 0px;
`;

export default function HectareInfoPopup({
  popup: { position, hectare },
  continentLocation,
}: {
  popup: OwnedHectarePopupMetadata;
  continentLocation: ContinentLocation;
  items: CartItem[];
}) {
  const FULL_ACRE_PRICE = 1250;

  const percentsOwned =
    hectare.hectareOwnerships
      ?.map((owner) => owner.fractions)
      .reduce((prev, curr) => prev + curr, 0) || 0;

  const totalHectaresSelected =
    hectare.hectareType === "entire"
      ? 1
      : Number((1 - percentsOwned / 100).toFixed(2));
  const names = hectare.hectareOwnerships.flatMap(
    (owner) => owner.donor.about + " - " + owner.fractions / 100 + " acres"
  );

  const highestFraction =
    hectare.hectareOwnerships.length > 0 &&
    hectare.hectareOwnerships.reduce((previous, current) => {
      return current.fractions > previous.fractions ? current : previous;
    });

  const isPartialAcre = hectare.hectareType === "partial";
  return (
    <PopupWrapper
      style={{
        top: calculatePositionY(position.clientY),
        left: calculatePositionX(position.clientX),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <Typography variant="subtitle2">Acre #{hectare.orderNumber}</Typography>
        <PriceText variant="h6">
          ${((FULL_ACRE_PRICE * (100 - percentsOwned)) / 100).toLocaleString()}
        </PriceText>
      </Box>
      {isPartialAcre && highestFraction && highestFraction.donor.name && (
        <Typography variant="subtitle2" fontWeight="700">
          {highestFraction.donor.name}
        </Typography>
      )}

      <Divider></Divider>
      <ImpactScore
        totalHectares={totalHectaresSelected}
        cottonTopMonkeysProtected={Math.ceil(
          (continentLocation.cottonTopMonkeysSaved /
            continentLocation.totalHectares) *
            (totalHectaresSelected || 1) *
            1.0
        )}
        treesPlanted={Math.ceil(
          (continentLocation.treesPlantedOrSaved /
            continentLocation.totalHectares) *
            (totalHectaresSelected || 1) *
            1.0
        )}
        carbonOffset={
          +(
            (continentLocation.annualCarbonOffset /
              continentLocation.totalHectares) *
            (totalHectaresSelected || 1) *
            1.0
          ).toFixed(2)
        }
        isPopup={true}
      />

      {isPartialAcre && names.length > 0 && (
        <>
          {names.map((name) => {
            return (
              <Typography
                key={name}
                variant="subtitle2"
                component="p"
                fontSize="0.75rem"
              >
                {name}
              </Typography>
            );
          })}
        </>
      )}
    </PopupWrapper>
  );
}
