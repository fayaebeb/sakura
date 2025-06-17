import { atom } from "recoil";

export const isMobileState = atom<boolean>({
  key: "isMobileState",
  default: typeof window !== "undefined" ? window.innerWidth < 768 : true,
}); 