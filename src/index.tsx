import { definePlugin } from "@decky/api";
import { afterPatch, wrapReactType, Patch } from "@decky/ui";
import { FaCircle } from "react-icons/fa";

const React = (window as any).SP_REACT;

const GameSticker = React.memo(({ appId }: { appId: number }) => {
  if (!appId) return null;
  return (
    <div style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "#1a9fff",
      color: "white",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "12px",
      zIndex: 9999,
      pointerEvents: "none"
    }}>
      ID: {appId}
    </div>
  );
});

export default definePlugin(() => {
  let radarPatch: Patch | undefined;
  let isTargetFound = false;

  console.log("[Completionist] DEBUG: Plugin starting...");

  if (!React) {
    console.error("[Completionist] DEBUG ERROR: React (SP_REACT) not found!");
  }

  if (React) {
    radarPatch = afterPatch(React, "createElement", (_args, ret: any) => {
      try {
        // --- STEP 1: Capture return object ---
        if (!ret) return ret;

        // --- STEP 2: Check for logo property ---
        const logoUrl = ret?.props?.strLogoImageURL;
        if (!logoUrl) return ret;

        console.log("[Completionist] DEBUG 1: Logo URL detected ->", logoUrl);

        // --- STEP 3: Regex Match ---
        // I corrected the regex: [0-9] instead of \[0-9\]
        const match = logoUrl.match(/\/assets\/([0-9]+)\//);
        const appId = match ? parseInt(match[1]) : null;
        console.log("[Completionist] DEBUG 2: AppID extracted ->", appId);

        if (!appId) return ret;

        // --- STEP 4: Component Type Check ---
        const TargetClass = ret.type;
        console.log("[Completionist] DEBUG 3: Target type is ->", typeof TargetClass);

        if (typeof TargetClass === 'function' && !TargetClass.__patched) {
          console.log("[Completionist] DEBUG 4: Patching component 'P'...");

          const OriginalComponent = TargetClass;

          // --- STEP 5: Wrapper Logic ---
          ret.type = (props: any) => {
            try {
              const res = OriginalComponent(props);
              return (
                <React.Fragment>
                  {res}
                  <GameSticker appId={appId} />
                </React.Fragment>
              );
            } catch (e) {
              console.error("[Completionist] DEBUG ERROR: Crash inside Wrapper ->", e);
              return null;
            }
          };

          // --- STEP 6: Finalizing Patch ---
          ret.type.__patched = true;
          console.log("[Completionist] DEBUG 5: Wrapping React Type...");
          wrapReactType(ret.type);
          
          if (!isTargetFound) {
            isTargetFound = true;
            console.log("[Completionist] DEBUG 6: Target secured. Deactivating radar soon.");
            setTimeout(() => {
              if (radarPatch) {
                radarPatch.unpatch();
                radarPatch = undefined;
                console.log("[Completionist] DEBUG 7: Radar off.");
              }
            }, 2000);
          }
        }
      } catch (err) {
        console.error("[Completionist] DEBUG GLOBAL CRASH:", err);
      }
      return ret;
    });
  }

  return {
    name: "completionist",
    title: "Completionist",
    icon: <FaCircle />,
    onDismount() {
      if (radarPatch) radarPatch.unpatch();
    }
  };
});