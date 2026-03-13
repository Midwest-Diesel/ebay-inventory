import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import { ChangeEvent, useEffect, useRef } from "react";

interface Props extends InputHTML {
  className?: string
  labelClass?: string
  variant?: ('auto-size' | 'label-stack' | 'label-bold' | 'label-stack' | 'label-no-stack' | 'label-space-between' | 'md-text' | 'label-full-width' | 'label-bold' | 'label-inline' | 'label-no-margin' | 'no-style' | 'label-fit-content')[]
  label?: string
  cols?: number
  rows?: number
}


export default function TextArea({ className = '', labelClass = '', variant = [], label, cols, rows, value, defaultValue, ...props }: Props) {
  const labelClassList = variant.filter((v) => v.includes('label'));
  const classes = generateClasses(className, variant ? variant.filter((v) => !labelClassList.includes(v)) : [], 'text-area');
  const labelClasses = generateClasses(labelClass, labelClassList, 'text-area');
  const growRef = useRef<HTMLDivElement | null>(null);
  const isAutoSize = variant.includes('auto-size');

  useEffect(() => {
    const initialValue = 
      (value as string | undefined) ?? 
      (defaultValue as string | undefined) ?? 
      '';
    handleInput(initialValue);
  }, [value, defaultValue]);

  const handleInput = (replicatedValue: string) => {
    if (!isAutoSize || !growRef.current) return;
    growRef.current.dataset.replicatedValue = replicatedValue;
  };

  
  return (
    <label {...parseClasses(labelClasses)}>
      { label }

      <div className="text-area__grow-wrap" ref={growRef} data-replicated-value="">
        <textarea
          {...parseClasses(classes)}
          {...props as any}
          cols={cols}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onInput={(e: ChangeEvent<HTMLTextAreaElement>) => handleInput(e.target.value)}
        />
      </div>
    </label>
  );
}
