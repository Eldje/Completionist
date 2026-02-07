import { definePlugin } from "@decky/api";
import { afterPatch, Patch } from "@decky/ui";
import { FaCircle } from "react-icons/fa";

const React = (window as any).SP_REACT;

/**
 * Sticker Component - Positioned at the bottom-right
 */
const GameSticker = React.memo(({ appId }: { appId: number }) => {
  console.log(`[Completionist] LOG 10: Final Render of GameSticker for ${appId}`);
  return (
    <div style={{
      position: "absolute",
      bottom: "10px",    // Positioned at the bottom
      right: "10px",     // Positioned at the right
      backgroundColor: "#1a9fff",
      color: "white",
      padding: "6px 12px",
      borderRadius: "4px",
      zIndex: 9999,
      border: "1px solid rgba(255,255,255,0.4)",
      fontSize: "12px",
      fontWeight: "bold",
      boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
      pointerEvents: "none"
    }}>
      ID: {appId}
    </div>
  );
});

export default definePlugin(() => {
  let radarPatch: Patch | undefined;

  console.log("[Completionist] LOG 1: Plugin Starting");

  if (React) {
    console.log("[Completionist] LOG 2: React Found");

    // We use "_" for unused "args" to satisfy the compiler
    radarPatch = afterPatch(React, "createElement", (_, ret: any) => {
      const logoUrl = ret?.props?.strLogoImageURL;
      if (!logoUrl) return ret;

      console.log("[Completionist] LOG 4: Logo detected ->", logoUrl);

      const match = logoUrl.match(/\/assets\/([0-9]+)\//);
      const appId = match ? parseInt(match[1]) : null;

      if (!appId) return ret;

      console.log(`[Completionist] LOG 6: Encapsulating for App ${appId}`);

      try {
        if (ret.__alreadyWrapped) return ret;

        console.log("[Completionist] LOG 7: Creating Wrap Element");

        const newRet = React.createElement(
          "div", // We use a div as a container to ensure relative positioning
          { 
            style: { position: "relative", display: "contents" },
            __alreadyWrapped: true 
          },
          ret,
          React.createElement(GameSticker, { appId: appId })
        );

        // Mark the object manually as well
        newRet.__alreadyWrapped = true;

        console.log("[Completionist] LOG 8: Return successfully encapsulated (Bottom-Right)");
        return newRet;

      } catch (e) {
        console.error("[Completionist] LOG ERROR: Encapsulation failed", e);
        return ret;
      }
    });
  }

  return {
    name: "completionist",
    title: "Completionist",
    icon: <FaCircle />,
    onDismount() {
      console.log("[Completionist] LOG 13: Cleanup");
      if (radarPatch) radarPatch.unpatch();
    }
  };
});