import { Layout } from "@/components/Layout";
import { ask } from "@/scripts/config/tauri";
import { deleteOffer, editItemListingStatus, getAddonItemFromSku, getInventoryItemBySku, getInventoryItems, getOfferBySku, publishOffer, updateOffer } from "@/scripts/services/ebayService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Button, Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


const FULFILLMENT_POLICY_ID = import.meta.env.PROD ? 287416755015 : 6228403000;

export default function Drafts() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: catalogItems, refetch } = useQuery<CatalogItem[]>({
    queryKey: ['catalogItems'],
    queryFn: () => getInventoryItems(100, 0)
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const list: Offer[] = [];
      const items = (catalogItems ?? []).map((o) => o.sku);

      for (let i = 0; i < items.length; i++) {
        const res = await getOfferBySku(items[i]);
        if (res) list.push(res);
      }

      setOffers(list.filter((offer) => offer.status === 'UNPUBLISHED'));
      setLoading(false);
    };
    fetchData();
  }, [catalogItems]);

  const getListingDescription = async (offer: Offer): Promise<string> => {
    const item = await getInventoryItemBySku(offer.sku);
    if (!item) {
      alert('Failed to fetch item');
      return offer.listingDescription;
    }

    return `
      <div style="max-width: 750px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333;">
        <header style="border:1px solid #000000;margin-bottom: 20px;">
          <img src="C:/Intel/ebayheader.jpg" style="width: 100%; height: auto; display: block;" alt="Product Banner" />
        </header>

        <div style="border:1px solid #b9b0b0;border-radius:5px;padding:15px;">
          <h2 style="font-size: 20px; margin: 25px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Product Information
          </h2>
          <p style="font-weight: bold;text-decoration: underline;">NEW 1607689 Caterpillar Plug</p>

          <div style="display: flex; flex-wrap: wrap; gap: 1%; justify-content: center; padding: 5px 0;">
            ${item.product.imageUrls.map((img, i) =>
              `<img src="${img}" alt="Image ${i}" style="width:22%;border-radius:8px;">`
            )
            .join('')}
          </div>

          <h2 style="font-size: 20px; margin: 25px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Order Fulfillment / Shipping
          </h2>
          <div style="font-size: 16px;">
            <ul>
              <li>Most Orders Require 1 Business Day Handling Time</li>
              <li>Free Shipping Includes Economy / Standard Ground Service (1-7 Day Delivery via USPS, UPS or Fedex)</li>
              <li>Expedited Shipping Service Available for Additional Cost</li>
              <li>LTL Freight Shipments (When Applicable) May Be Subject to  Additional Surcharges for Liftgate and/or Residential Delivery</li>
              <li>Shipping Currently Not Available to PO Boxes, APO/FPO Addresses</li>
            </ul>
            <p style="font-weight: bold;">Shipping to Alaska / Hawaii or Will Call Pickup? Contact Us at 888-866-3406</p>
          </div>

          <h2 style="font-size: 20px; margin: 30px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Midwest Diesel Quality 
          </h2>
          <div style="font-size: 16px;">
            <ul>
              <li>We Rigorously Inspect All Parts In Our Inventory and Aim to Accurately Represent All Items to Ensure Customer Satisfaction</li>
            </ul>
            <p style="font-weight: bold;">Questions Regarding Condition or Fitment? Call Us at 888-866-3406 Before Ordering</p>
          </div>

          <h2 style="font-size: 20px; margin: 30px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Return Policy
          </h2>
          <div style="font-size: 16px;">
            <p>Customer Returns are Accepted Based on the Following Conditions:</p>
            <ul>
              <li>Buyer Pays Return Shipping</li>
              <li>Item Returned in Same Condition as Originally Shipped</li>
              <li>Returned Orders Are Subject to a Restocking Fee. </li>
              <li>Contact Us at 888-866-3406 For A Return Authorization Number Before Returning Your Order</li>
            </ul>
          </div>

          <h2 style="font-size: 20px; margin: 30px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Sales Tax
          </h2>
            <ul>
              <li>State Sales Tax Is Applied By eBay to Orders Where Required</li> 
              <li>Tax Exemption Must Be Applied For Through eBay</li>
            </ul>
          </p>

          <h2 style="font-size: 20px; margin: 30px 0 12px 0; border-bottom: 2px solid #F7CB27; padding-bottom: 8px;">
            Why Midwest Diesel?
          </h2>
          <p style="font-size: 16px;">
            Midwest Diesel is a premier source for new, surplus and used Caterpillar and Cummins engines and engine parts, trusted by dealers, repair shops and owner/operators for over 30 years. WIth over 50,000 OEM parts in stock and a customer service staff with nearly 100 years of combined industry experience, Midwest Diesel is your first source for top-quality, in-demand and hard-to-find engine components at the best prices anywhere. Midwest Diesel has both the inventory and experience to exceed your expectations!
          </p>
        </div>
      </div>
    `;
  };

  const onClickPublish = async (offer: Offer) => {
    if (offer.pricingSummary.price.value <= 0.99) return alert('Price must be greater than $0.99');
    if (!await ask(`Are you sure you want to publish ${offer.sku}?`)) return;

    setLoading(true);
    const data: Offer = {
      ...offer,
      listingPolicies: {
        fulfillmentPolicyId: FULFILLMENT_POLICY_ID,
        paymentPolicyId: FULFILLMENT_POLICY_ID
      },
      includeCatalogProductDetails : true,
      merchantLocationKey: 'warehouse',
      listingDescription: await getListingDescription(offer)
    };
    await updateOffer(data);
    await publishOffer(data);
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


  if (offers.length === 0 && !loading) return <Layout><h1>Drafts</h1> <p>No content</p></Layout>;

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
                  <td>{ formatCurrency(offer.pricingSummary.price.value) }</td>
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
