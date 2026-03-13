import { atom } from "jotai";

const user = {
  id: null,
  username: null,
} as any;

export const userAtom = atom<User>(user);
export const toastAtom = atom<Toast[]>([]);
export const tooltipAtom = atom<string>('');
