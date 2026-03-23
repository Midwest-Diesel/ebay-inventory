declare module '@midwest-diesel/mwd-ui' {
  export * from '@midwest-diesel/mwd-ui/dist/index.d.ts';
}

/* eslint-disable */
interface ButtonHTML extends React.HTMLProps<HTMLButtonElement> {}
interface InputHTML extends React.InputHTMLAttributes<HTMLInputElement> {}
interface TableHTML extends React.HTMLProps<HTMLTableElement> {}
interface SelectHTML extends React.InputHTMLAttributes<HTMLSelectElement> {}
/* eslint-enable */

type User = {
  id: number
  username: string
};

type Toast = {
  id?: number
  msg: string
  type: 'error' | 'success' | 'warning' | 'none'
  duration?: number
};
