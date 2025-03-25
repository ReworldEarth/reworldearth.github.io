export type Asset = {
  url: string;
  mimeType: string;
};

export type RichText = {
  html: string;
  text: string;
};

export type Contacts = {
  calendlyLink: string;
  email: string;
  phone: string;
  instagramLink: string;
  facebookLink: string;
  linkedInLink: string;
  blogLink: string;
};

export type Vacation = {
  name: string;
};

export type Donor = {
  id: string;
  name: string;
  bio: string;
  image: Asset;
  hectareOwnerships?: {
    hectare?:
      | {
          orderNumber: number;
        }[]
      | {
          orderNumber: number;
        };
  }[];
  about?: string;
};

export type ContinentLocation = {
  name: string;
  slug: string;
  isFeatured: boolean;
  mainBanner: Asset;
  vacations: Vacation[];
  kmlFile: Asset;
  continentLocationHectares: Hectare[];
  totalHectares: number;
  cottonTopMonkeysSaved: number;
  treesPlantedOrSaved: number;
  annualCarbonOffset: number;
};

export type Hectare = {
  id?: string;
  boundings: {
    northEast: string;
    southWest: string;
    center: string;
  };
  version: number;
  hectareType: "entire" | "partial";
  orderNumber: number;
  cottonTopMonkeysProtected: number;
  threesPlantedOrSaved: number;
  annualCarbonOffset: number;
  owners?: {
    name: string;
    hectarePercentsOwned: number;
    bio: string;
    image?: {
      id?: string;
      url?: string;
    };
  }[];
  hectareOwnerships: {
    donor: {
      id: string;
      name: string;
      bio?: string;
      image?:
        | {
            id?: string;
            url?: string;
          }
        | Asset[];
      orderIds?: number[];
      about?: string;
    };
    fractions: number;
  }[];
  acreCount?: number;
};

export type Continent = {
  name: string;
  slug: string;
  mainBanner: Asset;
  continentLocations: ContinentLocation[];
};

export interface LocationPageProps {
  continentLocation: ContinentLocation;
  donors: Donor[];
}

export interface ImpactMetricGuide {
  content: RichText;
}

export type ImpactScore = {
  acres: number;
  cottonTopsProtected: number;
  treesPlanted: number;
  carbonRemovedTons: number;
};
