import { Layout } from "@/components/Layout";
import { getInventoryItems, getOfferBySku } from "@/scripts/services/ebayService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


export default function Listings() {
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


  return (
    <Layout>
      <h1>Listings</h1>

      <Table className="catalog-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Desc</th>
            <th>Available Qty</th>
            <th>Price</th>
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
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Layout>
  );
}
