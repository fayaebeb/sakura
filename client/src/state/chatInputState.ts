// @/state/chatInputState.ts
import { atom } from "recoil";

export const chatInputState = atom<string>({
  key: "chatInputState",
  default: "",
});
