import api from '../config/axios';
import { open } from '@tauri-apps/plugin-shell';


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
        
        const res = await api.get(`https://inventory-server.up.railway.app/api/ebay/code`);
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

const { accessToken, expiresAt, refreshToken, refreshExpiresAt } = JSON.parse(localStorage.getItem('ebay') || '{}');
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'X-EBAY-REFRESH-TOKEN': refreshToken,
  'X-EBAY-EXPIRES-AT': expiresAt,
  'X-EBAY-REFRESH-EXPIRES-AT': refreshExpiresAt
};

// === GET routes === //

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const res = await api.get(`/api/ebay/session`, { headers });
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
  try {
    const params = { limit, offset };
    const res = await api.get(`/api/ebay/catalog-items`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getOffer = async (sku: string): Promise<Offer | null> => {
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

export const setAccessToken = async () => {
  try {
    const res = await api.post(`/api/ebay/consent-url`);
    const code = await getEbayAuthCode(res.data.url);

    const session = await api.post(`/api/ebay/token`, { code });
    localStorage.setItem('ebay', JSON.stringify(session.data));
  } catch (error) {
    console.error(error);
  }
};

export const createOrReplaceInventoryItem = async (item: CatalogItem): Promise<boolean> => {
  try {
    await api.post(`/api/ebay/catalog-item`, { item });
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
  try {
    await api.post(`/api/ebay/create-offer`, offer);
  } catch (error) {
    console.error(error);
  }
};

export const publishOffer = async (offerId: number) => {
  try {
    await api.post(`/api/ebay/publish-offer`, { offerId });
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

export const updateOffer = async (offer: Offer) => {
  try {
    await api.put(`/api/ebay/update-offer`, offer);
  } catch (error) {
    console.error(error);
  }
};

export const editBulkAddonItems = async (items: AddOnItem[]) => {
  try {
    await api.put(`/api/ebay/items/bulk`, { items });
  } catch (error) {
    console.error(error);
    alert(`Error in [editBulkAddonItems] ${error}`);
  }
};
