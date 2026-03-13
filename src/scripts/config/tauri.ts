import { isTauri, invoke as tauriInvoke } from "@tauri-apps/api/core";
import { confirm as tauriConfirm, ask as tauriAsk } from "@tauri-apps/plugin-dialog";
import { windowConfirm } from "../tools/utils";

export const invoke = async (cmd: string, args?: any) => {
  if (!isTauri()) return;
  return (await tauriInvoke(cmd, args)) as any;
};

export const confirm = async (msg: string): Promise<boolean> => {
  if (!isTauri()) return windowConfirm(msg);
  return await tauriConfirm(msg);
};

export const ask = async (msg: string) => {
  if (!isTauri()) return windowConfirm(msg);
  return await tauriAsk(msg);
};