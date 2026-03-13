import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import React from "react";

interface Props {
  variant?: ('default')[]
  children: React.ReactNode
  className?: string
}


export default function Grid({ children, className = '', variant = [] }: Props) {
  const classes = generateClasses(className, variant, 'grid');


  return (
    <div {...parseClasses(classes)}>
      { children }
    </div>
  );
}
