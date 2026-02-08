import { afterPatch, wrapReactType, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGamesCapsulesPatch = (): Patch | undefined => {
  if (!React) return undefined;

  console.log("[Completionist] LOG 2b: Initializing Capsules Patch");

  return afterPatch(React, "createElement", (_, ret: any) => {
    const appId = ret?.props?.app?.appid;
    if (!appId) return ret;

    const TargetClass = ret.type;
    if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
      
      console.log(`[Completionist] LOG 6b: Patching Capsule Prototype for App ${appId}`);
      const originalRender = TargetClass.prototype.render;
      
      TargetClass.prototype.render = function(...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);
        
        // Safety check to avoid the "Cannot read properties of undefined" crash
        const currentAppId = this.props?.app?.appid;
        if (!currentAppId) return renderRet;

        return renderRet ? (
          <React.Fragment>
            {renderRet}
            <GameSticker appId={currentAppId} variant="capsule" />
          </React.Fragment>
        ) : renderRet;
      };

      TargetClass.prototype.render.__patched = true;
      wrapReactType(TargetClass);
    }
    return ret;
  });
};