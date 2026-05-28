import { Layout } from "@/components/Layout";
import { deleteOffer, editItemListingStatus, getAddonItemFromSku, getInventoryItems, getOfferBySku, withdrawOffer } from "@/scripts/services/ebayService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Button, Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { ask } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";


export default function Listings() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: catalogItems, refetch } = useQuery<CatalogItem[]>({
    queryKey: ['catalogItems'],
    queryFn: () => getInventoryItems(100, 0),
    enabled: import.meta.env.PROD
  });

  useEffect(() => {
    let injectedItems: string[] = [];
    if (!import.meta.env.PROD) {
      injectedItems = ['BR326-17D', 'UP21491'];
    }

    const fetchData = async () => {
      setLoading(true);

      const list: Offer[] = [];
      const items = [...injectedItems, ...(catalogItems ?? []).map((o) => o.sku)];

      for (let i = 0; i < items.length; i++) {
        const res = await getOfferBySku(items[i]);
        if (res) list.push(res);
      }

      setOffers(list.filter((offer) => offer.status === 'PUBLISHED'));
      setLoading(false);
    };
    fetchData();
  }, [catalogItems]);

  const onClickWithdrawOffer = async (offer: Offer) => {
    if (!await ask(`Are you sure you want to withdraw ${offer.sku}?`)) return;
  
    setLoading(true);
    await withdrawOffer(offer);
    setLoading(() => false);

    setLoading(() => true);
    refetch();
  };

  const onClickDelete = async (offer: Offer) => {
    if (!await ask(`Are you sure you want to delete ${offer.sku}?`)) return;
    
    await deleteOffer(offer);
    const item = await getAddonItemFromSku(offer.sku);
    if (!item) return;

    await editItemListingStatus(item.id, 'PENDING');
    setLoading(true);
    refetch();
  };


  if (offers.length === 0 && !loading) return <Layout><h1>Listings</h1> <p>No content</p></Layout>;

  return (
    <Layout>
      <h1>Listings</h1>

      {loading ?
        <p>Loading...</p>
      :
        <Table className="catalog-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Desc</th>
              <th>Available Qty</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer: Offer) => {
              return (
                <tr key={offer.sku}>
                  <td>{ offer.sku }</td>
                  <td>{ offer.listingDescription }</td>
                  <td>{ offer.availableQuantity }</td>
                  <td>{ formatCurrency(offer.pricingSummary.price.value) }</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <Button onClick={() => onClickWithdrawOffer(offer)}>Unpublish</Button>
                      <Button variant={['danger']} onClick={() => onClickDelete(offer)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      }
    </Layout>
  );
}
