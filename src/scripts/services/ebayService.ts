import axios from "axios";
import api from "../config/axios";
import { invoke } from "../config/tauri";
import { open } from '@tauri-apps/plugin-shell';


const isProd = import.meta.env.PROD;
const SERVER_URL = 'https://inventory-server.up.railway.app';

// === GET routes === //

async function getEbayAuthCode(clientId: string, ruName: string, scopes: string): Promise<string> {
  const consentUrl = isProd ? 'https://auth.ebay.com/oauth2/authorize' : 'https://auth.sandbox.ebay.com/oauth2/authorize';
  open(`${consentUrl}?client_id=${clientId}&redirect_uri=${ruName}&response_type=code&scope=${scopes}`);

  return new Promise<string>((resolve, reject) => {
    const maxRequests = 60;
    let requestCount = 0;
    const interval = setInterval(async () => {
      try {
        if (requestCount >= maxRequests) reject('Max requests');
        const res = await axios.get(`${SERVER_URL}/api/ebay/code`, { withCredentials: true });
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
    const clientId = await invoke('get_env_var', { varName: 'EBAY_CLIENT_ID' });
    const ruName = await invoke('get_env_var', { varName: 'EBAY_REDIRECT_URL' });
    const scopes = encodeURIComponent(await invoke('get_env_var', { varName: 'EBAY_SCOPES' }));
    const code = await getEbayAuthCode(clientId, ruName, scopes);
    const url = isProd ? 'https://api.ebay.com/identity/v1/oauth2/token' : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
    await axios.post(`${SERVER_URL}/api/ebay/token`, { code, url, isProd }, { withCredentials: true });
  } catch (error) {
    console.error(error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.get(`${SERVER_URL}/api/ebay/session`, { withCredentials: true });
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
    const params = { limit, offset, isProd };
    const res = await axios.get(`${SERVER_URL}/api/ebay/catalog-items`, { withCredentials: true, params });
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// === POST routes === //

export const createOrReplaceInventoryItem = async (item: CatalogItem): Promise<boolean> => {
  try {
    await axios.post(`${SERVER_URL}/api/ebay/catalog-item`, { item, isProd }, { withCredentials: true });
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
