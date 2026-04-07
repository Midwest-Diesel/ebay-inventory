import { invoke } from "@/scripts/config/tauri";
import api from "../config/axios";


// === GET routes === //

export const getImagesFromStockNum = async (stockNum: string): Promise<Picture[]> => {
  try {
    const res = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFileFromPath = async (filepath: string): Promise<File | null> => {
  try {
    const bytes: number[] = await invoke('get_file', { filepath });
    const blob = new Blob([new Uint8Array(bytes)]);
    const fileName = filepath.split('\\').pop();
    if (!fileName) return null;
    return new File([blob], fileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error(error);
    return null;
  }
};

// === POST routes === //

export const uploadImageToBucket = async (file: File): Promise<{ key: string, url: string } | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const headers = { 'Content-Type': 'multipart/form-data' };

    const res = await api.post('/api/bucket/upload', formData, { headers });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
