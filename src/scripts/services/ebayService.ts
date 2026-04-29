import api from '../config/axios';
import { open } from '@tauri-apps/plugin-shell';


const isProd = import.meta.env.PROD;
const catalogItems = [
  {
    sku: 'BR326-17D',
    availability: {
      shipToLocationAvailability: {
        quantity: 1
      }
    },
    condition: 'NEW_OTHER',
    packageWeightAndSize: {
      dimensions: {
        length: 1,
        width: 1,
        height: 1,
        unit: 'FEET'
      },
      weight: {
        value: 10,
        unit: 'POUND'
      },
      packageType: 'VERY_LARGE_PACK'
    },
    product: {
      title: 'NTO BRACKET',
      description: 'NTO BRACKET',
      imageUrls: ['\\\\MWD1-SERVER\\Server\\Pictures\\sn_specific\\BR326-17D\\BR3216-1.jpg'],
    }
  }
] as CatalogItem[];

const offers = [
  {
    sku: 'BR326-17D',
    categoryId: 259088,
    marketplaceId: 'EBAY_US',
    merchantLocationKey: 'warehouse',
    format: 'FIXED_PRICE',
    listingDescription: '(10.0) NEW SURPLUS, PLUG CONNECTION',
    availableQuantity: 20,
    quantityLimitPerBuyer: 1,
    listingPolicies: {
      fulfillmentPolicyId: 287416755015,
      paymentPolicyId: 287416755015
    },
    includeCatalogProductDetails: true,
    pricingSummary: {
      price: {
        value: 0,
        currency: 'USD'
      }
    }
  }
] as Offer[];

// === GET routes === //

async function getEbayAuthCode(consentUrl: string): Promise<string> {
  open(consentUrl);

  return new Promise<string>((resolve, reject) => {
    const maxRequests = 60;
    let requestCount = 0;
    const interval = setInterval(async () => {
      try {
        if (requestCount >= maxRequests) {
          clearInterval(interval);
          reject('Max requests');
        }
        
        const res = await api.get(`/api/ebay/code`);
        if (res.data.code) {
          clearInterval(interval);
          resolve(res.data.code);
        }
        requestCount += 1;
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 1000);
  });
}

export const setAccessToken = async () => {
  try {
    const res = await api.post(`/api/ebay/consent-url`, { isProd });
    const code = await getEbayAuthCode(res.data.url);

    const url = isProd ? 'https://api.ebay.com/identity/v1/oauth2/token' : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
    await api.post(`/api/ebay/token`, { code, url, isProd });
  } catch (error) {
    console.error(error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const res = await api.get(`/api/ebay/session`);
    return res.data.accessToken;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const getAddonItems = async (listingStatus: ListingStatus): Promise<AddOnItem[]> => {
  try {
    const res = await api.get(`/api/ebay/${listingStatus}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getInventoryItems = async (limit: number, offset: number): Promise<CatalogItem[]> => {
  if (!isProd) return catalogItems;

  try {
    const params = { limit, offset, isProd };
    const res = await api.get(`/api/ebay/catalog-items`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getOffer = async (sku: string): Promise<Offer | null> => {
  if (!isProd) return offers.find((o) => sku === o.sku) ?? null;

  try {
    const params = { sku };
    const res = await api.get(`/api/ebay/offer`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === POST routes === //

export const createOrReplaceInventoryItem = async (item: CatalogItem): Promise<boolean> => {
  if (!isProd) return false;

  try {
    await api.post(`/api/ebay/catalog-item`, { item, isProd });
    return false;
  } catch (error: any) {
    console.error(error);
    const message = (
      error?.response?.data?.errors?.[0]?.message ||
      error?.response?.data?.message ||
      error.message ||
      'Unknown error'
    );
    alert(`Error in [createOrReplaceInventoryItem] ${message}`);
    return true;
  }
};

export const createOffer = async (offer: UnfinishedOffer) => {
  if (!isProd) return;

  try {
    await api.post(`/api/ebay/create-offer`, offer);
  } catch (error) {
    console.error(error);
  }
};

export const publishOffer = async (offerId: number) => {
  if (!isProd) return;

  try {
    await api.post(`/api/ebay/publish-offer`, { offerId });
  } catch (error) {
    console.error(error);
  }
};

// === PUT routes === //

export const updateOffer = async (offer: Offer) => {
  if (!isProd) return;

  try {
    await api.put(`/api/ebay/update-offer`, offer);
  } catch (error) {
    console.error(error);
  }
};

// === PATCH routes === //

export const editItemListingStatus = async (id: number, listingStatus: ListingStatus) => {
  try {
    await api.patch(`/api/ebay/listing-status`, { id, listingStatus });
  } catch (error) {
    console.error(error);
    alert(`Error in [editItemListingStatus] ${error}`);
  }
};

export const editItemImageUrls = async (id: number, imageUrls: string[]) => {
  try {
    await api.patch(`/api/ebay/image-urls`, { id, imageUrls });
  } catch (error) {
    console.error(error);
    alert(`Error in [editItemImageUrls] ${error}`);
  }
};


// === PUT routes === //

export const editBulkAddonItems = async (items: AddOnItem[]) => {
  try {
    await api.put(`/api/ebay/items/bulk`, { items });
  } catch (error) {
    console.error(error);
    alert(`Error in [editBulkAddonItems] ${error}`);
  }
};
