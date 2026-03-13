import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props extends TableHTML {
  children: any
  variant?: ('plain' | 'row-details' | 'edit-row-details' | 'fit')[]
}


export default function Table({ children, className = '', variant = [], ...props }: Props) {
  const classes = generateClasses(className, variant, 'table');

  return (
    <table
      {...parseClasses(classes)}
      {...props}  
    >
      { children }
    </table>
  );
}
