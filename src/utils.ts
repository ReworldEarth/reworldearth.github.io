import { Hectare, ImpactScore } from "./types";

export const HECTARE_TO_ACRE_UNIT = 2.47;

const computeImpact = (
  hectares: Hectare[],
  totalImpactMetrics: ImpactScore
): ImpactScore => {
  const impactScore: ImpactScore = {
    acres: 0,
    cottonTopsProtected: 0,
    treesPlanted: 0,
    carbonRemovedTons: 0,
  };
  if (hectares.length === 0) {
    return impactScore;
  }
  const fractions = hectares
    .flatMap((hectare) => {
      if (hectare.hectareType === "entire") {
        return 100;
      } else {
        return hectare.hectareOwnerships
          .filter((ho) => ho.donor.id === "1001")
          .flatMap((owner) => {
            return owner.fractions;
          });
      }
    })
    .reduce((acc, cur) => {
      return (acc || 0) + cur;
    }, 0);
  console.log("fractions", fractions, hectares, totalImpactMetrics);
  impactScore.acres = fractions / 100;
  impactScore.carbonRemovedTons =
    (totalImpactMetrics.carbonRemovedTons / totalImpactMetrics.acres) *
    impactScore.acres;
  impactScore.cottonTopsProtected =
    (totalImpactMetrics.cottonTopsProtected / totalImpactMetrics.acres) *
    impactScore.acres;
  impactScore.treesPlanted =
    (totalImpactMetrics.treesPlanted / totalImpactMetrics.acres) *
    impactScore.acres;
  return impactScore;
};

export default computeImpact;

export const numberWithCommas = (num: number): string => {
  const floatNum = num.toFixed(2);
  var parts = floatNum.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const parsedNumber =
    parts.length > 1
      ? parts[0].indexOf(",") > -1
        ? parts.join(".")
        : Number(parts.join(".")).toFixed(2)
      : parts[0];
  return `$${parsedNumber}`;
};

export const calculatePositionX = (clientX: number) => {
  if (clientX + 100 > window.innerWidth) {
    return clientX - 100;
  }
  return clientX + 100;
};

export const calculatePositionY = (clientY: number) => {
  if (clientY + 100 > window.innerHeight) {
    return clientY - 100;
  }
  return clientY + 100;
};
