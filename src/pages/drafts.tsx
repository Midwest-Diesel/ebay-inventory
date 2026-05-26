import { Layout } from "@/components/Layout";
import { ask } from "@/scripts/config/tauri";
import { getInventoryItems, getOfferBySku, publishOffer, updateOffer } from "@/scripts/services/ebayService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Button, Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


const FULFILLMENT_POLICY_ID = 287416755015;

export default function Drafts() {
  const [offers, setOffers] = useState<Offer[]>([]);

  const { data: catalogItems = [] } = useQuery<CatalogItem[]>({
    queryKey: ['catalogItems'],
    queryFn: () => getInventoryItems(9999, 0)
  });

  useEffect(() => {
    if (catalogItems.length === 0) return;

    const fetchData = async () => {
      const list: Offer[] = [];
      for (let i = 0; i < catalogItems.length; i++) {
        const res = await getOfferBySku(catalogItems[i].sku);
        if (res) list.push(res);
      }

      setOffers(list);
    };
    fetchData();
  }, [catalogItems]);

  const onClickPublish = async (offer: Offer) => {
    if (!ask(`Are you sure you want to publish ${offer.sku}?`)) return;

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
    await publishOffer(data.id);
  };


  return (
    <Layout>
      <h1>Drafts</h1>

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
                <td><Button onClick={() => onClickPublish(offer)}>Publish</Button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Layout>
  );
}
