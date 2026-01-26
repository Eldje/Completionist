import {
    routerHook,
    definePlugin
} from "@decky/api";
import {
    afterPatch,
    findInReactTree,
    wrapReactType,
} from "@decky/ui";
import { ReactElement } from "react";
import { FaCircle } from "react-icons/fa";

// Your sticker component
// Component for the sticker - Positioned absolutely over the capsule
const GameSticker = ({ appId }: { appId: number }) => (
  <div 
    key="sticker-overlay"
    style={{
      position: "absolute",
      top: "-10px", // Appears slightly above the capsule
      right: "-10px",
      backgroundColor: "#ff1a1a", // Red for visibility
      color: "white",
      borderRadius: "12px",
      padding: "4px 8px",
      fontSize: "12px",
      fontWeight: "bold",
      zIndex: 9999,
      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      pointerEvents: "none",
      border: "2px solid white"
    }}
  >
    ID: {appId}
  </div>
);

export default definePlugin(() => {
  const React = (window as any).SP_REACT;
  
  if (React) {
    afterPatch(React, "createElement", (args, ret: any) => {
      const appId = ret?.props?.app?.appid;
      
      if (appId) {
        const TargetClass = ret.type;
        
        if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
          const originalRender = TargetClass.prototype.render;
          
          TargetClass.prototype.render = function(...renderArgs: any[]) {
            const renderRet = originalRender.apply(this, renderArgs);
            
            if (renderRet) {
              // We use a Fragment to return both the original element AND our sticker
              // This way, the original element's props and refs stay intact for Steam
              return React.createElement(
                React.Fragment,
                null,
                renderRet,
                React.createElement(GameSticker, { appId: appId })
              );
            }
            return renderRet;
          };
          
          TargetClass.prototype.render.__patched = true;
          wrapReactType(TargetClass);
          console.log(`[Sticker] Overlay injected for ${appId}`);
        }
      }
      return ret;
    });
  }

  // Return the plugin object with required interface (name, icon)
  return {
    name: "my-custom-sticker", // Matches your folder name requirement
    icon: <FaCircle />,
    onDismount() {
      // Decky handles patch removal automatically
      console.log("Sticker plugin unmounted successfully");
    },
  };
});