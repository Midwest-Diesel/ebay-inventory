import PicturesDialog from "@/components/dialogs/PicturesDialog";
import { Layout } from "@/components/Layout";
import useAutoSave from "@/hooks/useAutoSave";
import { createOffer, createOrReplaceInventoryItem, editBulkAddonItems, editItemImageUrls, editItemListingStatus, getAddonItems } from "@/scripts/services/ebayService";
import { getFileFromPath, getImagesFromStockNum, uploadImageToBucket } from "@/scripts/services/imagesService";
import { Button, Input, Select, Table, TextArea } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


const PRIMARY_CATEGORY_ID = 259088;
const FULFILLMENT_POLICY_ID = 287416755015;
const BUY_LIMIT = 1;

export default function Catalog() {
  const [items, setItems] = useState<AddOnItem[]>([]);
  const [picturesDialogOpen, setPicturesDialogOpen] = useState(false);
  const [stockNumForPics, setStockNumForPics] = useState('');

  const { data: itemsData } = useQuery<AddOnItem[]>({
    queryKey: ['items'],
    queryFn: () => getAddonItems('PENDING')
  });

  const { data: pictures = [], isFetching } = useQuery<Picture[]>({
    queryKey: ['pictures', stockNumForPics],
    queryFn: () => getImagesFromStockNum(stockNumForPics),
    enabled: Boolean(stockNumForPics)
  })

  useEffect(() => {
    if (itemsData && items.length === 0) {
      setItems(itemsData);
    }
  }, [itemsData]);

  const onChangeEditItem = (item: AddOnItem) => {
    setItems(items.map((i) => {
      if (i.id !== item.id) return i;
      return item;
    }));
  };

  const onClickAddItem = async (item: AddOnItem) => {
    const imageUrls: string[] = [];
    for (const img of item.localImages) {
      const file = await getFileFromPath(img);
      if (!file) continue;
      const res = await uploadImageToBucket(file);
      if (res) imageUrls.push(res.url);
    }

    const catalogItem: CatalogItem = {
      sku: item.stockNum,
      availability: {
        shipToLocationAvailability: {
          quantity: item.qty
        }
      },
      condition: item.condition,
      packageWeightAndSize: {
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: 'INCH'
        },
        weight: {
          value: 10,
          unit: 'POUND'
        },
        packageType: 'VERY_LARGE_PACK'
      },
      product: {
        title: item.title,
        description: item.desc,
        imageUrls
      }
    };
    const error = await createOrReplaceInventoryItem(catalogItem);
    if (error) return;

    await editItemListingStatus(item.id, 'COMPLETE');
    await editItemImageUrls(item.id, imageUrls);
    setItems(items.filter((i) => i.id !== item.id));


    const unpublishedOffer: UnfinishedOffer = {
      sku: item.stockNum,
      format: 'FIXED_PRICE',
      categoryId: PRIMARY_CATEGORY_ID,
      marketplaceId: 'EBAY_US',
      listingDescription: item.desc,
      availableQuantity: item.qty,
      quantityLimitPerBuyer: BUY_LIMIT,
      pricingSummary: {
        price: {
          value: item.unitPrice,
          currency: 'USD'
        }
      }
    };
    await createOffer(unpublishedOffer);

    const offer: Offer = {
      ...unpublishedOffer,
      listingPolicies: {
        fulfillmentPolicyId: FULFILLMENT_POLICY_ID,
        paymentPolicyId: FULFILLMENT_POLICY_ID
      },
      includeCatalogProductDetails : true,
      merchantLocationKey: 'warehouse'
    };
  };

  const onClickOpenPictures = (stockNum: string) => {
    setPicturesDialogOpen(true);
    setStockNumForPics(stockNum);
  };

  const onSelectPictures = (localImages: string[], stockNum: string) => {
    setItems(items.map((item) => {
      if (item.stockNum !== stockNum) return item;
      return { ...item, localImages };
    }));
  };

  useAutoSave(items, async () => {
    await editBulkAddonItems(items.map((i) => ({ ...i, qty: Number(i.qty) })));
  }, { ignoreFirstSave: true });
  

  return (
    <Layout>
      {picturesDialogOpen &&
        <PicturesDialog
          open={picturesDialogOpen}
          setOpen={setPicturesDialogOpen}
          pictures={pictures}
          stockNum={stockNumForPics}
          items={items}
          onSave={onSelectPictures}
          isFetching={isFetching}
        />
      }
      <h1>Pending Items</h1>

      <Table className="catalog-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Title</th>
            <th>Desc</th>
            <th>Addon Qty</th>
            <th>Qty</th>
            <th>Condition</th>
            <th>Manufacturer</th>
            <th>Images</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <Input
                    value={item.stockNum}
                    onChange={(e) => onChangeEditItem({ ...item, stockNum: e.target.value })}
                  />
                </td>
                <td>
                  <TextArea
                    value={item.title}
                    onChange={(e) => onChangeEditItem({ ...item, title: e.target.value })}
                  />
                </td>
                <td>
                  <TextArea
                    value={item.desc}
                    onChange={(e) => onChangeEditItem({ ...item, desc: e.target.value })}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>{ item.addonQty }</td>
                <td>
                  <Input
                    value={item.qty || ''}
                    onChange={(e: any) => onChangeEditItem({ ...item, qty: e.target.value })}
                    type="number"
                  />
                </td>
                <td>
                  <Select
                    value={item.condition}
                    onChange={(e) => onChangeEditItem({ ...item, condition: e.target.value as Condition })}
                  >
                    <option>NEW_OTHER</option>
                    <option>USED_GOOD</option>
                    <option>FOR_PARTS_OR_NOT_WORKING</option>
                    <option>GOOD_REFURBISHED</option>
                  </Select>
                </td>
                <td>
                  <Select
                    value={item.manufacturer ?? ''}
                    onChange={(e) => onChangeEditItem({ ...item, manufacturer: e.target.value as Manufacturer })}
                  >
                    <option value="">Empty</option>
                    <option>Caterpillar</option>
                  </Select>
                </td>
                <td>
                  <p style={{ fontSize: 'var(--font-xsm)', textAlign: 'center' }}>{ item.localImages.length } Selected</p>
                  <Button variant={['no-style']} className="image-btn" onClick={() => onClickOpenPictures(item.stockNum)}>
                    <img src="/images/image.svg" alt="" />
                  </Button>
                </td>
                <td><Button onClick={() => onClickAddItem(item)}>Add</Button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Layout>
  );
}
