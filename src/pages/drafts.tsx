import { Layout } from "@/components/Layout";
import { getInventoryItems } from "@/scripts/services/ebayService";
import { Button, Table } from "@midwest-diesel/mwd-ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export default function Drafts() {
  const [status, setStatus] = useState<'pending' | 'published'>('pending');

  const { data: catalogItems = [] } = useQuery<CatalogItem[]>({
    queryKey: ['catalogItems'],
    queryFn: () => getInventoryItems(20, 0)
  });


  return (
    <Layout>
      <Button variant={['fit']}>{ status === 'pending' ? 'Published' : 'Pending' } Drafts</Button>

      {status === 'pending' &&
        <Table className="catalog-table">
          <thead>
            <tr>
              <th>SKU</th>
            </tr>
          </thead>
          <tbody>
            {catalogItems.map((item) => {
              return (
                <tr key={item.sku}>
                  <td>{ item.sku }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      }
    </Layout>
  );
}
