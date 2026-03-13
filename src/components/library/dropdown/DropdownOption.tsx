interface Props {
  children: any
  value: string | number
  className?: string
  onClick?: () => void
  disabled?: boolean
}


export default function DropdownOption({ children, value = '', className, onClick, disabled = false }: Props) {
  return (
    <li className={`dropdown__option ${className || ''}${disabled ? ' dropdown__option--disabled' : ''}`} onClick={() => (onClick && !disabled) && onClick()} data-value={value} data-testid={`dropdown-option-${value}`}>
      { children }
    </li>
  );
}
