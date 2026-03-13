import { generateClasses, parseClasses } from "../../scripts/tools/utils";
import React, { Children, useState, useEffect, useRef, ReactElement } from "react";
import Input from "./Input";
import DropdownOption from "./dropdown/DropdownOption";

interface DropdownOptionProps {
  value: string
  data?: any
  children: string
  onClick?: () => void
  className?: string
}

interface Props {
  children: ReactElement<DropdownOptionProps>[]
  className?: string
  variant?: ('small' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value?: string
  onChange?: (value: string, data?: any) => void
  onBlur?: (value: string) => void
  maxHeight?: string
  minWidth?: string
}


export default function InputDropdown({ children, className = '', variant = [], label = '', value = '', onChange, onBlur, maxHeight = 'none', minWidth = 'none' }: Props) {
  const classes = generateClasses(className, variant.filter((v) => !['label-stack', 'label-space-between', 'label-bold'].includes(v)), 'dropdown-input');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownOptions = Children.toArray(children) as ReactElement<DropdownOptionProps>[];

  useEffect(() => {
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const nextFocused = e.relatedTarget as Node | null;
      if (containerRef.current && nextFocused && !containerRef.current.contains(nextFocused)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    const el = containerRef.current;
    el?.addEventListener('focusout', handleFocusOut);
    window.addEventListener('click', handleClickOutside);

    return () => {
      el?.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const selectOption = (value: string, data?: any) => {
    setSearch('');
    setIsOpen(false);
    onChange?.(value, data);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case 'Escape':
        e.preventDefault();
        break;
      default:
        return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (!filteredOptions.length) return;

    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    }

    if (e.key === 'Enter') {
      const option = filteredOptions[highlightedIndex];
      if (option) {
        selectOption(option.props.value, option.props.data);
      }
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const filteredOptions = dropdownOptions.filter((option) => {
    const text = option.props.children;
    return typeof text === 'string' && text.toLowerCase().includes(search.toLowerCase());
  });

  let labelClass = '';
  if (variant.includes('label-space-between')) labelClass += 'input--label-space-between ';
  if (variant.includes('label-stack')) labelClass += 'dropdown-input--label-stack ';
  if (variant.includes('label-bold')) labelClass += 'dropdown-input--label-bold ';


  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: variant.includes('gap') ? '0.5rem' : 0
      }}
      className={labelClass}
    >
      <p className="dropdown-input__label">{ label }</p>

      <div className="dropdown-input__container">
        <ul {...parseClasses(classes)}>
          <Input
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              onChange?.(e.target.value);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => onBlur?.(e.target.value)}
            ref={inputRef}
          />

          <div
            className="dropdown-input__menu"
            style={{
              minWidth,
              visibility: isOpen ? "visible" : "hidden",
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none"
            }}
          >
            <div className="dropdown-input__menu-scroll" style={{ maxHeight }} tabIndex={-1}>
              {filteredOptions.length ? (
                filteredOptions.map((option, i) => (
                  <DropdownOption
                    key={i}
                    {...option.props}
                    className={i === highlightedIndex ? "dropdown-input__option dropdown-input__option--highlighted" : "dropdown-input__option"}
                    onClick={() => selectOption(option.props.value, option.props.data)}
                  />
                ))
              ) : (
                <p className="dropdown-input__no-results">No results found</p>
              )}
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
}
