declare module '@midwest-diesel/mwd-ui' {
  export * from '@midwest-diesel/mwd-ui/dist/index.d.ts';
}

type User = {
  id: number
  username: string
};

type Toast = {
  id?: number
  msg: string
  type: 'error' | 'success' | 'warning' | 'none'
  duration?: number
};

type Picture = {
  id: string
  name: string
  url: string
};

type ListingStatus = 'PENDING' | 'COMPLETE';
type Manufacturer = 'Caterpillar' | null;
type Condition = 'NEW_OTHER' | 'USED_GOOD' | 'FOR_PARTS_OR_NOT_WORKING' | 'GOOD_REFURBISHED';
type LengthUnit = 'INCH' | 'FEET' | 'CENTIMETER' | 'METER';
type WeightUnit = 'POUND' | 'KILOGRAM' | 'OUNCE' | 'GRAM';
type PackageType = 'VERY_LARGE_PACK'; // https://developer.ebay.com/api-docs/sell/inventory/types/slr:PackageTypeEnum
type Marketplace = 'EBAY_US';
type OfferFormat = 'FIXED_PRICE' | 'AUCTION';
type ShippingServiceType = 'DOMESTIC' | 'INTERNATIONAL';

type AddOnItem = {
  id: number
  stockNum: string
  partNum: string
  title: string
  desc: string
  manufacturer: Manufacturer
  condition: Condition
  listingStatus: ListingStatus
  addonQty: number
  qty: number
  unitPrice: number
  localImages: string[]
  imageUrls: string[]
  createdAt: Date
  updatedAt: Date
};

type CatalogItem = {
  sku: string
  availability: {
    shipToLocationAvailability: {
      quantity: number
    }
  }
  condition: Condition
  packageWeightAndSize: {
    dimensions: {
      length: number
      width: number
      height: number
      unit: LengthUnit
    },
    weight: {
      value: number
      unit: WeightUnit
    },
    packageType: PackageType
  }
  product: {
    title: string
    description: string
    imageUrls: string[]
  }
};

type Offer = {
  sku: string
  categoryId: number
  marketplaceId: Marketplace
  merchantLocationKey: string
  format: OfferFormat
  listingDescription: string
  availableQuantity: number
  quantityLimitPerBuyer: number
  listingPolicies: {
    fulfillmentPolicyId: number
  }
  pricingSummary: {
    price: {
      value: number
      currency: 'USD'
    }
  }
}
