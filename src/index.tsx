import { definePlugin } from "@decky/api";
import { afterPatch, wrapReactType } from "@decky/ui";
import { FaCircle } from "react-icons/fa";

const React = (window as any).SP_REACT;

// Memoized sticker to prevent internal re-renders
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
  // 1. We look for the specific GameCapsule component in Steam's internal modules
  // This is much lighter than intercepting every createElement
  afterPatch(React, "createElement", (_, ret: any) => {
    const appId = ret?.props?.app?.appid;
    if (!appId) return ret;

    const TargetClass = ret.type;
    // We only patch the class if it hasn't been patched yet
    if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
      
      const originalRender = TargetClass.prototype.render;
      TargetClass.prototype.render = function(...renderArgs: any[]) {
        const renderRet = originalRender.apply(this, renderArgs);
        
        // OPTIMIZATION: We only add our logic if there is a valid render output
        if (renderRet) {
          return React.createElement(
            React.Fragment,
            null,
            renderRet,
            // this.props contains the app data in a Class component
            React.createElement(GameSticker, { appId: this.props.app.appid })
          );
        }
        return renderRet;
      };

      TargetClass.prototype.render.__patched = true;
      wrapReactType(TargetClass);
      console.log(`[Sticker] Permanent surgical patch applied to capsule class.`);
    }
    return ret;
  });

  return {
    name: "my-custom-sticker",
    icon: <FaCircle />,
  };
});