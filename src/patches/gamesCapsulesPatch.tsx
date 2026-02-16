import { afterPatch, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGamesCapsulesPatch = (onFirstRender: () => void): Patch | undefined => {
  if (!React) return undefined;

  return afterPatch(React, "createElement", (_, ret: any) => {
    const appId = ret?.props?.app?.appid;
    if (!appId) return ret;

    const Target = ret.type;
    if (Target.prototype?.render && !Target.prototype.render.__patched) {
      const originalRender = Target.prototype.render;

      Target.prototype.render = function (...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);

        // Activate unpatch function at the first render because 
        // it will be no longer needed after that because the prototype 
        // ot the render function for the game detail element has been patched
        if (onFirstRender) {
          onFirstRender();
          // Releasing the unpath function to not call it again after first render
          //onFirstRender = () => { };
        }

        // Get current appId at time of render
        const appId = this.props?.app?.appid;

        // Adding the badge to the element
        return renderRet ? (
          <React.Fragment>
            {renderRet}
            <GameSticker appId={appId} variant="capsule" />
          </React.Fragment>
        ) : renderRet;
      };

      Target.prototype.render.__patched = true;
    }
    return ret;
  });
};