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

type Condition = 'NEW_OTHER' | 'USED_GOOD' | 'FOR_PARTS_OR_NOT_WORKING' | 'GOOD_REFURBISHED';
type LengthUnit = 'INCH' | 'FEET' | 'CENTIMETER' | 'METER';
type WeightUnit = 'POUND' | 'KILOGRAM' | 'OUNCE' | 'GRAM';
type PackageType = 'MAILING_BOX'; // https://developer.ebay.com/api-docs/sell/inventory/types/slr:PackageTypeEnum

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
