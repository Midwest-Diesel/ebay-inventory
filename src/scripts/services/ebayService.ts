import api from "../config/axios";


const isProd = import.meta.env.PROD;
const INVENTORY_API_URL = isProd ? 'https://api.ebay.com/sell/inventory/v1' : 'https://api.sandbox.ebay.com/sell/inventory/v1';

// === GET routes === //

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
    const headers = { Authorization: import.meta.env.VITE_PUBLIC_EBAY_USER_TOKEN };
    const res = await api.get(`${INVENTORY_API_URL}/inventory_item?limit=${limit}&offset=${offset}`, { headers });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// === POST routes === //

export const createOrReplaceInventoryItem = async (item: CatalogItem) => {
  try {
    const headers = { Authorization: import.meta.env.VITE_PUBLIC_EBAY_USER_TOKEN };
    await api.post(`${INVENTORY_API_URL}/inventory_item/${item.sku}`, item, { headers });
  } catch (error) {
    console.error(error);
    alert(`Error in [createOrReplaceInventoryItem] ${error}`);
  }
};