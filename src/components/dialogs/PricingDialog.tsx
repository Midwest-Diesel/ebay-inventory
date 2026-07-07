import { formatCurrency } from "@/scripts/tools/stringUtils";
import { Dialog, Table } from "@midwest-diesel/mwd-ui";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  item: AddOnItem
}


export default function PricingDialog({ open, setOpen, item }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Pricing"
      x={-250}
      y={-100}
    >
      <Table>
        <thead>
          <tr>
            <th>New List Price</th>
            <th>Reman List Price</th>
            <th>Dealer Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{ formatCurrency(item.newListPrice) }</td>
            <td>{ formatCurrency(item.remanListPrice) }</td>
            <td>{ formatCurrency(item.dealerPrice) }</td>
          </tr>
        </tbody>
      </Table>
    </Dialog>
  );
}
