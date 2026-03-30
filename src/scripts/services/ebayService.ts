import axios from "axios";
import api from "../config/axios";
import { invoke } from "../config/tauri";
import { open } from '@tauri-apps/plugin-shell';


let accessToken: string;
const isProd = import.meta.env.PROD;
const INVENTORY_API_URL = isProd ? 'https://api.ebay.com/sell/inventory/v1' : 'https://api.sandbox.ebay.com/sell/inventory/v1';

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
        const res = await axios.get('https://inventory-server.up.railway.app/api/ebay/code', { withCredentials: true });
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
    const ruName = await invoke('get_env_var', { varName: 'REDIRECT_URL' });
    const scopes = encodeURIComponent(await invoke('get_env_var', { varName: 'SCOPES' }));
    const code = await getEbayAuthCode(clientId, ruName, scopes);
    const url = isProd ? 'https://api.ebay.com/identity/v1/oauth2/token' : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
    await axios.post('https://inventory-server.up.railway.app/api/ebay/token', { code, url, isProd }, { withCredentials: true });
  } catch (error) {
    console.error(error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.get('https://inventory-server.up.railway.app/api/ebay/session', { withCredentials: true });
    accessToken = res.data.accessToken;
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
    const headers = { Authorization: `Bearer ${accessToken}` };
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
    const headers = { Authorization: `Bearer ${accessToken}` };
    await api.post(`${INVENTORY_API_URL}/inventory_item/${item.sku}`, item, { headers });
  } catch (error) {
    console.error(error);
    alert(`Error in [createOrReplaceInventoryItem] ${error}`);
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


// === PUT routes === //

export const editBulkAddonItems = async (items: AddOnItem[]) => {
  try {
    await api.put(`/api/ebay/items/bulk`, { items });
  } catch (error) {
    console.error(error);
    alert(`Error in [editBulkAddonItems] ${error}`);
  }
};
