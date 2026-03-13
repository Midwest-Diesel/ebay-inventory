import { generateClasses, generateRandId, parseClasses } from "../../../scripts/tools/utils";
import React, { Children, useState, useEffect, useRef } from "react";
import DropdownOption from "./DropdownOption";

interface Props {
  children: any
  className?: string
  variant?: ('small' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value?: string
  onChange?: (value?: any, data?: any) => void
  onBlur?: (value: string) => void
  maxHeight?: string
  minWidth?: string
}


export default function Dropdown({ children, className = '', variant = [], label = '', value = '', onChange, onBlur, maxHeight = 'none', minWidth = 'none' }: Props) {
  const classes = generateClasses(className, variant.filter((v) => !["label-stack", "label-space-between", "label-bold"].includes(v)), "dropdown");
  const [isOpen, setIsOpen] = useState(false);
  const [idProp, setIdProp] = useState('');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  let id = '';

  const removeDuplicateRows = (dropdownOptions: any[]) => {
    const seenValues = new Set();
    return dropdownOptions.filter((child: any) => {
      const value = child.props.value;
      if (seenValues.has(value)) return false;
      seenValues.add(value);
      return true;
    });
  };

  const dropdownOptions: any = removeDuplicateRows(Children.toArray(children));
  const defaultValue = value || dropdownOptions[0]?.props?.value;
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [previouslySelectedOption, setPreviouslySelectedOption] = useState(defaultValue);

  useEffect(() => {
    id = generateRandId();
    setIdProp(id);
    window.addEventListener("click", handleScreenClick);
    return () => window.removeEventListener("click", handleScreenClick);
  }, []);

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleScreenClick = (e: any) => {
    const clickedDropdown = e.target.closest(".dropdown__option") || e.target.closest(".dropdown--input");
    if (!clickedDropdown) setIsOpen(false);
  };

  const selectOption = (value: string, data?: any) => {
    setSelectedOption(value);
    setSearch('');
    setIsOpen(false);
    if (onChange && previouslySelectedOption !== value) {
      onChange(value, data);
      setPreviouslySelectedOption(value);
    }
  };

  const filteredOptions = dropdownOptions.filter((child: any) =>
    child.props.children.toLowerCase().includes(search.toLowerCase())
  );

  let labelClass = "";
  if (variant.includes("label-space-between")) labelClass += "dropdown--label-space-between ";
  if (variant.includes("label-stack")) labelClass += "dropdown--label-stack ";
  if (variant.includes("label-bold")) labelClass += "dropdown--label-bold ";


  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: variant.includes("gap") ? "0.5rem" : 0 }} className={labelClass}>
      <p className="dropdown__label">{ label }</p>
      <div className="dropdown__container">
        <ul {...parseClasses(classes)} style={isOpen ? { position: "absolute", zIndex: 2 } : {}}>
          {isOpen ? (
            <>
              <input
                ref={searchRef}
                type="text"
                className="dropdown__search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={(e) => onBlur && onBlur(e.target.value)}
              />

              {/* Dropdown options */}
              <div style={{ maxHeight, minWidth, overflowY: "auto", overflowX: 'hidden' }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((child: any, i: number) => {
                    const { value, children, data } = child.props;
                    return (
                      <DropdownOption key={i} {...child.props} onClick={() => selectOption(value, data)}>
                        { children }
                      </DropdownOption>
                    );
                  })
                ) : (
                  <p className="dropdown__no-results">No results found</p>
                )}
              </div>
            </>
          ) : (
            <DropdownOption className={`dropdown__option--selected drop-id-${idProp}`} value={selectedOption} onClick={() => setIsOpen(true)}>
              {dropdownOptions.find((child: any) => child.props.value === selectedOption)?.props.children}
              <img className="dropdown__arrow" src="/images/icons/arrow-down.svg" alt="arrow" width={20} height={20} />
            </DropdownOption>
          )}
        </ul>
      </div>
    </div>
  );
}