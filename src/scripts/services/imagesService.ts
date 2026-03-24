import { invoke } from "@/scripts/config/tauri";


export const getImagesFromStockNum = async (stockNum: string): Promise<Picture[]> => {
  try {
    const res: any = await invoke('get_stock_num_images', { pictureArgs: { stock_num: stockNum }});
    return res.filter((pic: Picture) => pic.name !== 'Thumbs.db') ?? [] as Picture[];
  } catch (err) {
    console.error('Error getting stock images:', err);
    return [];
  }
};
