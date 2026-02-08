import { afterPatch, wrapReactType, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGameDetailPatch = (onFirstRender: () => void): Patch | undefined => {
  if (!React) return undefined;

  return afterPatch(React, "createElement", (_, ret: any) => {
    const overview = ret?.props?.overview;
    if (!overview || ret.props.details) return ret;

    const TargetClass = ret.type;

    if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
      const originalRender = TargetClass.prototype.render;

      TargetClass.prototype.render = function(...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);
        
        if (onFirstRender) {
          onFirstRender();
          // On vide la fonction pour ne plus jamais l'appeler
          onFirstRender = () => {}; 
        }

        const appId = this.props?.overview?.appid || 0;
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