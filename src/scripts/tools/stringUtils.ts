export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${m}/${day}/${y}`;
};

export const parseResDate = (date: string): Date | null => {
  if (!date || typeof date !== 'string') return null;
  if (date.includes('T')) {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const parseDateInputValue = (date: Date | null): string => {
  return date && typeof date === 'object' && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
};

export const cap = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatCurrency = (amount: any): string => {
  amount = parseFloat(amount);
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  if (!amount) return '$0.00';
  const [integerPart, decimalPart] = amount.toFixed(2).split('.');
  const newIntPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${newIntPart}.${decimalPart}`;
};

export const formatPercent = (amount: number | null): string => {
  if (amount == null || isNaN(amount)) return '';
  const percent = Math.ceil(amount * 100 * 100) / 100;
  const hasDecimal = percent % 1 !== 0;
  const formatted = hasDecimal ? percent.toFixed(2) : percent.toFixed(0);
  const [integerPart, decimalPart] = formatted.split('.');
  const newIntPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return hasDecimal
    ? `${newIntPart}.${decimalPart.replace(/0+$/, '')}%`
    : `${newIntPart}%`;
};

export const formatPhone = (value: string | null | undefined, noParens?: boolean) => {
  if (!value || value === '') return '';
  if (value === '+') return value;

  // Separate the country code and the rest of the number
  let countryCode = '';
  let restOfNumber = value;
  
  if (value.charAt(0) === '+') {
    const match = value.match(/\+\d*/);
    countryCode = match ? match[0].slice(0, 2) + ' ' : '';
    restOfNumber = value.slice(countryCode.length);
  } else if (value.length === 10) {
    restOfNumber = value;
  } else if (value.length === 11) {
    countryCode = '+' + value.slice(0, 1) + ' ';
    restOfNumber = value.slice(1);
  } else if (value.length >= 15) {
    countryCode = '+' + value.slice(-1) + ' ';
    restOfNumber = value.slice(0, -1);
  }

  const pattern = /\(\d{1,3}$/;
  if (pattern.test(restOfNumber)) restOfNumber = restOfNumber.slice(0, -1);

  // Remove all non-digit characters from the rest of the number
  const digits = restOfNumber.replace(/\D/g, '');

  // Format the local number based on its length
  let formattedLocalNumber = '';
  if (digits.length < 3) {
    formattedLocalNumber = `(${digits})`;
  } else if (digits.length <= 6) {
    formattedLocalNumber = `(${digits.slice(0, 3)})` + (digits.length > 3 ? ` ${digits.slice(3)}` : '');
  } else {
    formattedLocalNumber = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  let result = countryCode + formattedLocalNumber;
  if (result === '()') return '';
  else if (/^\+\d+ \(\)$/.test(result)) return result.split(' ')[0];

  if (noParens) {
    result = result.replace(/\(/g, '').replace(/\)/g, '').replace(' ', '-');
  }
  return result;
};

export const toAbsolutePath = (url: string) => url.startsWith('/') ? url : `/${url}`;
