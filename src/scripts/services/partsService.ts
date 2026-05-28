import api from "../config/axios";


// === PATCH routes === //

export const editPartListingId = async (stockNum: string, offerId: number | null) => {
  try {
    await api.patch('/api/parts/listing-id', { stockNum, offerId });
  } catch (error) {
    console.error(error);
    alert(`Error in [editPartListingId] ${error}`);
  }
};
