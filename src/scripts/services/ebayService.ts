import api from '../config/axios';
import { open } from '@tauri-apps/plugin-shell';
import { editPartListingId } from './partsService';


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

export const getEbayHeaders = () => {
  const { accessToken, expiresAt, refreshToken, refreshExpiresAt } = JSON.parse(localStorage.getItem('ebay') || '{}');
  
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-EBAY-REFRESH-TOKEN': refreshToken,
    'X-EBAY-EXPIRES-AT': expiresAt,
    'X-EBAY-REFRESH-EXPIRES-AT': refreshExpiresAt
  };
};

// === GET routes === //

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const res = await api.get(`/api/ebay/session`, { headers: getEbayHeaders() });
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

export const getAddonItemFromSku = async (sku: string): Promise<AddOnItem | null> => {
  try {
    const res = await api.get(`/api/ebay/add-ons/sku/${sku}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getInventoryItems = async (limit: number, offset: number): Promise<CatalogItem[]> => {
  try {
    const params = { limit, offset };
    const res = await api.get(`/api/ebay/catalog-items`, { params, headers: getEbayHeaders() });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getOfferBySku = async (sku: string): Promise<Offer | null> => {
  try {
    const params = { sku };
    const res = await api.get(`/api/ebay/offer/sku`, { params, headers: getEbayHeaders() });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOfferById = async (id: number): Promise<Offer | null> => {
  try {
    const params = { id };
    const res = await api.get(`/api/ebay/offer/id`, { params, headers: getEbayHeaders() });
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
    await api.post(`/api/ebay/catalog-item`, { item }, { headers: getEbayHeaders() });
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
    await api.post(`/api/ebay/create-offer`, offer, { headers: getEbayHeaders() });
  } catch (error) {
    console.error(error);
    alert(`Error in [createOffer] ${error}`);
  }
};

export const publishOffer = async (offer: Offer) => {
  try {
    const res = await api.post(`/api/ebay/publish-offer`, { offerId: offer.offerId }, { headers: getEbayHeaders() });
    if (!res.data) return null;
    await editPartListingId(offer.sku, Number(res.data.listingId));
  } catch (error) {
    console.error(error);
    alert(`Error in [publishOffer] ${error}`);
  }
};

export const withdrawOffer = async (offer: Offer) => {
  try {
    await api.post(`/api/ebay/withdraw-offer`, { offerId: offer.offerId }, { headers: getEbayHeaders() });
    await editPartListingId(offer.sku, null);
  } catch (error) {
    console.error(error);
    alert(`Error in [withdrawOffer] ${error}`);
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
    await api.put(`/api/ebay/update-offer`, offer, { headers: getEbayHeaders() });
  } catch (error) {
    console.error(error);
    alert(`Error in [updateOffer] ${error}`);
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

// === DELETE routes === //

export const deleteOffer = async (offer: Offer) => {
  try {
    await api.delete(`/api/ebay/offer/${offer.offerId}`, { headers: getEbayHeaders() });
    await editPartListingId(offer.sku, null);
  } catch (error) {
    console.error(error);
    alert(`Error in [deleteOffer] ${error}`);
  }
};
