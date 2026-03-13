import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import { useEffect, useRef, forwardRef } from "react";

interface Props extends InputHTML {
  children?: any
  className?: string
  labelClass?: string
  variant?: ('thin' | 'small' | 'x-small' | 'search' | 'label-stack' | 'label-no-stack' | 'label-space-between' | 'md-text' | 'label-full-width' | 'label-bold' | 'label-inline' | 'label-no-margin' | 'no-style' | 'label-fit-content' | 'autofill-input' | 'no-arrows')[]
  label?: string
  autofill?: string
  onAutofill?: (value: string) => void
}


const Input = forwardRef<HTMLInputElement, Props>(({ children, className = '', labelClass = '', autofill = '', onAutofill, variant = [], label, ...props }, ref) => {
  const labelClassList = variant.filter((v) => v.includes('label'));
  const classes = generateClasses(className, variant ? variant.filter((v) => !labelClassList.includes(v)) : [], 'input');
  const labelClasses = generateClasses(labelClass, labelClassList, 'input');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && variant.includes('autofill-input') && autofill) {
        e.preventDefault();
        if (inputRef.current) {
          (inputRef.current as HTMLInputElement).value = autofill;
          const event = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(event);
          if (onAutofill) onAutofill(autofill);
        }
      }
    };
    const currentInputRef = inputRef.current;
    if (currentInputRef) {
      currentInputRef.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (currentInputRef) {
        currentInputRef.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [autofill, variant]);

  
  return (
    <label {...parseClasses(labelClasses)}>
      { label }

      {!variant.includes('autofill-input') ?
        <input
          {...parseClasses(classes)}
          {...props}
          autoComplete="new-password"
          ref={ref}
        />
        :
        <div style={{ position: 'relative' }}>
          <input
            {...parseClasses(classes)}
            {...props}
            ref={inputRef}
            autoComplete="new-password"
          />
          <Input variant={['small', 'thin']} style={{ opacity: '0.5' }} value={autofill} onChange={() => {}} tabIndex={-1} />
        </div>
      }
      { children }
    </label>
  );
});

export default Input;
