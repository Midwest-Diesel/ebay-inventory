import api from "../config/axios";


// === PATCH routes === //

export const editPartOfferId = async (stockNum: string, offerId: number) => {
  try {
    await api.patch('/api/parts/offer-id', { stockNum, offerId });
  } catch (error) {
    console.error(error);
    alert(`Error in [editPartOfferId] ${error}`);
  }
};
