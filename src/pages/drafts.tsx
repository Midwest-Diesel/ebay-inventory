import { Layout } from "@/components/Layout";
import { ask } from "@/scripts/config/tauri";
import { deleteOffer, editItemListingStatus, getAddonItemFromSku, getInventoryItems, getOfferBySku, publishOffer, updateOffer } from "@/scripts/services/ebayService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Button, Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


const FULFILLMENT_POLICY_ID = 287416755015;

export default function Drafts() {
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

      setOffers(list);
      setLoading(false);
    };
    fetchData();
  }, [catalogItems]);

  const onClickPublish = async (offer: Offer) => {
    if (!await ask(`Are you sure you want to publish ${offer.sku}?`)) return;

    const data: Offer = {
      ...offer,
      listingPolicies: {
        fulfillmentPolicyId: FULFILLMENT_POLICY_ID,
        paymentPolicyId: FULFILLMENT_POLICY_ID
      },
      includeCatalogProductDetails : true,
      merchantLocationKey: 'warehouse'
    };
    await updateOffer(data);
    await publishOffer(Number(data.offerId));
  };

  const onClickDelete = async (offer: Offer) => {
    if (!await ask(`Are you sure you want to delete ${offer.sku}?`)) return;
    
    await deleteOffer(Number(offer.offerId));
    const item = await getAddonItemFromSku(offer.sku);
    if (!item) return;

    await editItemListingStatus(item.id, 'PENDING');
    setLoading(true);
    refetch();
  };


  return (
    <Layout>
      <h1>Drafts</h1>

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
                  <td>{ formatCurrency(offer.pricingSummary.price) }</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <Button onClick={() => onClickPublish(offer)}>Publish</Button>
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
