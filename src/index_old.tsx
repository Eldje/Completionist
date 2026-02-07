import { definePlugin } from "@decky/api";
import { afterPatch, wrapReactType, Patch } from "@decky/ui";
import { FaCircle } from "react-icons/fa";

const React = (window as any).SP_REACT;

/**
 * Sticker Component - Memoized to prevent unnecessary re-renders.
 */
const GameSticker = React.memo(({ appId }: { appId: number }) => (
  <div style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#1a9fff",
    color: "white",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "bold",
    zIndex: 9999,
    pointerEvents: "none"
  }}>
    ID: {appId}
  </div>
));

export default definePlugin(() => {
  // Correctly typing the radar as a Patch object
  let radarPatch: Patch | undefined;
  let isTargetFound = false;

  if (React) {
    radarPatch = afterPatch(React, "createElement", (_args, ret: any) => {
      const appId = ret?.props?.app?.appid;
      if (!appId) return ret;

      const TargetClass = ret.type;
      if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
        
        const originalRender = TargetClass.prototype.render;
        TargetClass.prototype.render = function(...renderArgs: any[]) {
          const renderRet = originalRender.apply(this, renderArgs);
          return renderRet ? (
            <React.Fragment>
              {renderRet}
              <GameSticker appId={this.props.app.appid} />
            </React.Fragment>
          ) : renderRet;
        };

        TargetClass.prototype.render.__patched = true;
        wrapReactType(TargetClass);
        
        if (!isTargetFound) {
          isTargetFound = true;
          console.log("[Sticker] Target found. Scheduling radar shutdown...");
          
          // Delayed unpatch to ensure all capsule variants are caught
          setTimeout(() => {
            if (radarPatch) {
              radarPatch.unpatch(); // Calling the correct method
              radarPatch = undefined;
              console.log("[Sticker] Radar successfully unpatched.");
            }
          }, 2000);
        }
      }
      return ret;
    });
  }

  return {
    name: "my-custom-sticker",
    icon: <FaCircle />,
    onDismount() {
      if (radarPatch) radarPatch.unpatch();
    }
  };
});