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

// === GET routes === //

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
    const res = await api.get(`/api/ebay/catalog-items`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getInventoryItemBySku = async (sku: string): Promise<CatalogItem | null> => {
  try {
    const res = await api.get(`/api/ebay/catalog-items/sku/${sku}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOfferBySku = async (sku: string): Promise<Offer | null> => {
  try {
    const params = { sku };
    const res = await api.get(`/api/ebay/offer/sku`, { params });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOfferById = async (id: number): Promise<Offer | null> => {
  try {
    const params = { id };
    const res = await api.get(`/api/ebay/offer/id`, { params });
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
    
    await api.post(`/api/ebay/token`, { code });
  } catch (error) {
    console.error(error);
  }
};

export const createImageFromUrl = async (imageUrl: string): Promise<string | null> => {
  try {
    const res = await api.post(`/api/ebay/create-image-from-url`, { imageUrl });
    if (!res.data?.imageUrl) return null;
    return res.data.imageUrl;
  } catch (error) {
    console.error(error);
    alert(`Error in [createImageFromUrl] ${error}`);
    return null;
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
    alert(`Error in [createOffer] ${error}`);
  }
};

export const publishOffer = async (offer: Offer) => {
  try {
    const res = await api.post(`/api/ebay/publish-offer`, { offerId: offer.offerId });
    if (!res.data) return null;
    await editPartListingId(offer.sku, Number(res.data.listingId));
  } catch (error) {
    console.error(error);
    alert(`Error in [publishOffer] ${error}`);
  }
};

export const withdrawOffer = async (offer: Offer) => {
  try {
    await api.post(`/api/ebay/withdraw-offer`, { offerId: offer.offerId });
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
    await api.put(`/api/ebay/update-offer`, offer);
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

export const editAddonItem = async (id: number, qty: number) => {
  try {
    await api.put(`/api/ebay/item`, { id, qty });
  } catch (error) {
    console.error(error);
    alert(`Error in [editAddonItem] ${error}`);
  }
};

// === DELETE routes === //

export const deleteOffer = async (offer: Offer) => {
  try {
    await api.delete(`/api/ebay/offer/${offer.offerId}`);
    await editPartListingId(offer.sku, null);
  } catch (error) {
    console.error(error);
    alert(`Error in [deleteOffer] ${error}`);
  }
};
