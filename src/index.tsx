import { definePlugin, routerHook } from "@decky/api";
import {
  afterPatch,
  findInReactTree,
  wrapReactType,
  PanelSection,
  PanelSectionRow
} from "@decky/ui";
import { FaHistory } from "react-icons/fa";

// Internal logs for debugging
const logs: string[] = ["Plugin initialized"];
const addLog = (m: string) => {
  logs.push(`[${new Date().toLocaleTimeString()}] ${m}`);
  console.log(`[recent-game-capture] ${m}`);
};

const RedDotOverlay = () => (
  <div style={{
    position: "absolute", top: "10px", right: "10px",
    width: "25px", height: "25px", backgroundColor: "#ff4444",
    borderRadius: "50%", border: "2px solid white", zIndex: 9999,
    pointerEvents: "none", boxShadow: "0 0 5px black"
  }} />
);

export default definePlugin(() => {
  let mainPatch: any;

  // We replicate the exact nesting strategy of SteamGridDB
  mainPatch = routerHook.addPatch('/library/home', (props: any) => {
    addLog("Home Route Patch triggered");

    afterPatch(props.children, 'type', (_: any[], ret?: any) => {
      if (!ret) return ret;
      addLog("Level 1: Route children patched");

      let cache2: any = null;
      wrapReactType(ret); // Crucial SGDB Step

      afterPatch(ret.type, 'type', (_: any[], ret2?: any) => {
        if (cache2) return cache2;
        if (!ret2) return ret2;
        addLog("Level 2: Internal route type patched");

        let cache3: any = null;
        // Looking for the Recents section
        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));

        if (recents) {
          addLog("Level 3: Recents section found in tree");
          wrapReactType(recents);

          afterPatch(recents.type, 'type', (_: any[], ret3?: any) => {
            cache2 = ret2;
            if (cache3) return cache3;
            if (!ret3) return ret3;
            addLog("Level 4: Recents component patched");

            const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);
            if (p) {
              addLog("Level 5: Games list container found");

              afterPatch(p, 'type', (_: any[], ret4?: any) => {
                cache3 = ret3;
                if (!ret4) return ret4;
                wrapReactType(ret4);

                afterPatch(ret4.type, 'type', (_: any[], ret5?: any) => {
                  if (!ret5) return ret5;

                  // Signature of the Carousel
                  const carouselProps = findInReactTree(ret5, (x) => x?.nItemHeight && x?.fnItemRenderer && x?.fnGetColumnWidth);

                  if (carouselProps) {
                    addLog("Level 6: Carousel Hooked!");

                    // Final injection into the item renderer
                    afterPatch(carouselProps, 'fnItemRenderer', (args: any[], ret6?: any) => {
                      if (!ret6) return ret6;

                      // args[0] is usually the index, but checking nLeft is safer in carousels
                      const isFirstItem = ret6.props?.nLeft === 0;
                      const appId = ret6.props?.appid;

                      // If you want the overlay ONLY on the first capsule:
                      if (isFirstItem) {
                        return (
                          <div style={{ position: "relative" }}>
                            {ret6}
                            <RedDotOverlay />
                            {/* Debug: display AppID over the first game */}
                            <div style={{
                              position: "absolute", bottom: "5px", left: "5px",
                              background: "black", color: "white", fontSize: "10px"
                            }}>
                              ID: {appId}
                            </div>
                          </div>
                        );
                      }

                      return ret6;
                    });
                  }
                  return ret5;
                });
                return ret4;
              });
            }
            return ret3;
          });
        }
        return ret2;
      });
      return ret;
    });
    return props;
  });

  return {
    name: "recent-game-capture",
    icon: <FaHistory />,
    onUnload() {
      if (mainPatch) {
        routerHook.removePatch('/library/home', mainPatch);
        addLog("Patch removed");
      }
    },
    content: (
      <PanelSection title="SGDB Drilling Logs">
        <PanelSectionRow>
          <div style={{ fontSize: "0.8em", color: "#66c0f4", fontFamily: "monospace" }}>
            {logs.slice().reverse().map((l, i) => <div key={i} style={{ borderBottom: "1px solid #222" }}>{l}</div>)}
          </div>
        </PanelSectionRow>
      </PanelSection>
    )
  };
});