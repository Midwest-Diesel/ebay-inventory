import PicturesDialog from "@/components/dialogs/PicturesDialog";
import { Layout } from "@/components/Layout";
import useAutoSave from "@/hooks/useAutoSave";
import { createOrReplaceInventoryItem, editBulkAddonItems, editItemListingStatus, getAddonItems, getInventoryItems } from "@/scripts/services/ebayService";
import { getImagesFromStockNum } from "@/scripts/services/imagesService";
import { Button, Input, Select, Table, TextArea } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";


export default function Catalog() {
  const [items, setItems] = useState<AddOnItem[]>([]);
  const [picturesDialogOpen, setPicturesDialogOpen] = useState(false);
  const [stockNumForPics, setStockNumForPics] = useState('');

  const { data: itemsData } = useQuery<AddOnItem[]>({
    queryKey: ['items'],
    queryFn: () => getAddonItems('PENDING')
  });

  const { data: catalogItems } = useQuery({
    queryKey: ['catalogItems'],
    queryFn: () => getInventoryItems(20, 0)
  });

  const { data: pictures = [] } = useQuery<Picture[]>({
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
    await editItemListingStatus(item.id, 'COMPLETE');
    setItems(items.filter((i) => i.id !== item.id));

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
          length: 0,
          width: 0,
          height: 0,
          unit: 'INCH'
        },
        weight: {
          value: 0,
          unit: 'POUND'
        },
        packageType: 'MAILING_BOX'
      },
      product: {
        title: item.title,
        description: item.desc,
        imageUrls: item.imageUrls
      }
    };
    await createOrReplaceInventoryItem(catalogItem);
  };

  const onClickOpenPictures = (stockNum: string) => {
    setPicturesDialogOpen(true);
    setStockNumForPics(stockNum);
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
        />
      }

      <a href="/" className="back-link">Back</a>
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
