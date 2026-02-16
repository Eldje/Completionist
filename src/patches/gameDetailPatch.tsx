import { afterPatch, Patch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initGameDetailPatch = (onFirstRender: () => void): Patch | undefined => {
  if (!React) return undefined;

  return afterPatch(React, "createElement", (_, ret: any) => {
    const overview = ret?.props?.overview;
    if (!overview || ret.props.details) return ret;

    const appId = ret.props?.overview?.appid;
    if (!appId) return ret;

    const Target = ret.type;

    if (Target.prototype?.render && !Target.prototype.render.__patched) {
      const originalRender = Target.prototype.render;

      Target.prototype.render = function (...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);

        // Activate unpatch function at the first render because 
        // it will be no longer needed after that because the prototype 
        // ot the render function for the game detail element has been patch
        if (onFirstRender) {
          onFirstRender();
          // Releasing the unpath function to not call it again after first render
          //onFirstRender = () => { };
        }

        // Get current appId at time of render
        const appId = this.props?.overview?.appid;

        // Adding the badge to the element
        return (
          <div style={{ position: "relative", display: "contents" }}>
            {renderRet}
            <GameSticker appId={appId} variant="banner" />
          </div>
        );
      };

      Target.prototype.render.__patched = true;
    }
    return ret;
  });
};