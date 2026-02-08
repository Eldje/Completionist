import { afterPatch, wrapReactType, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGameDetailPatch = (): Patch | undefined => {
  if (!React) return undefined;

  console.log("[Completionist] LOG 2a: Patching 'oe' Overview Class (The Holy Grail)");

  return afterPatch(React, "createElement", (_, ret: any) => {
    // 1. On vérifie d'abord si l'overview existe
    const hasOverview = ret?.props?.overview;
    if (!hasOverview) return ret;

    // 2. FILTRE : On ne veut que le composant 'oe'
    if (ret.props.details) {
        return ret; 
    }
    const TargetClass = ret.type;

    // Patch de Prototype : Robuste, Persistant, Indestructible
    if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {

      console.log("[Completionist] LOG 6a: Patching 'oe' Prototype.render for AppID:", ret.props.overview.appid);
      const originalRender = TargetClass.prototype.render;

      TargetClass.prototype.render = function (...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);

        // Extraction directe et ultra-fiable de l'ID
        const appId = this.props?.overview?.appid || 0;

        if (!appId) return renderRet;

        console.log(`[Completionist] LOG 8a: Rendering Badge via 'oe' Prototype for ID ${appId}`);

        // On injecte le badge dans le container de l'en-tête
        return (
          <div style={{ position: "relative", display: "contents" }}>
            {renderRet}
            <GameSticker appId={appId} variant="banner" />
          </div>
        );
      };

      TargetClass.prototype.render.__patched = true;
      wrapReactType(TargetClass);
    }
    return ret;
  });
};