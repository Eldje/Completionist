import { afterPatch, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGameDetailPatch = (): Patch | undefined => {
  if (!React) return undefined;

  console.log("[Completionist] LOG 2a: Initializing GameDetail Patch");

  return afterPatch(React, "createElement", (_, ret: any) => {
    const logoUrl = ret?.props?.strLogoImageURL;
    if (!logoUrl || ret.__alreadyWrapped) return ret;

    console.log("[Completionist] LOG 4a: Logo detected ->", logoUrl);

    const match = logoUrl.match(/\/assets\/([0-9]+)\//);
    const appId = match ? parseInt(match[1]) : null;
    if (!appId) return ret;

    try {
      const newRet = React.createElement(
        "div",
        { style: { position: "relative", display: "contents" }, __alreadyWrapped: true },
        ret,
        React.createElement(GameSticker, { appId: appId, variant: "banner" })
      );
      newRet.__alreadyWrapped = true;
      return newRet;
    } catch (e) {
      console.error("[Completionist] LOG ERROR: GameDetail encapsulation failed", e);
      return ret;
    }
  });
};