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
const GameSticker = ({ appId }: { appId: number }) => (
    <div style={{
        width: '12px',
        height: '12px',
        backgroundColor: '#ff5f5f',
        borderRadius: '50%',
        marginLeft: '4px', // Space it from the Steam Deck icons
        border: '1px solid white',
        boxShadow: '0 0 2px black'
    }} title={`AppID: ${appId}`} />
);
export default definePlugin(() => {
  // TECHNIQUE DE LA "SENTINELLE"
  // On surveille TOUS les rendus de composants jusqu'à trouver une GridCell
  const React = (window as any).SP_REACT;
  
  if (React) {
    afterPatch(React, "createElement", (args, ret: any) => {
      // On vérifie si l'élément créé est une cellule de grille de jeu
      const appId = ret?.props?.app?.appid;
      
      if (appId) {
        // POINT D'ARRÊT ICI : Il va se déclencher dès qu'un jeu apparaît à l'écran
        console.log(`[Sticker] Capture du jeu : ${ret.props.app.display_name} (ID: ${appId})`);

        // On descend dans le type pour patcher le rendu visuel
        const TargetClass = ret.type;
        
        if (typeof TargetClass === 'function' && TargetClass.prototype?.render && !TargetClass.prototype.render.__patched) {
          const originalRender = TargetClass.prototype.render;
          
          console.log(`[Sticker] function avec render`);
          TargetClass.prototype.render = function(...renderArgs: any[]) {
            const renderRet = originalRender.apply(this, renderArgs);
                  console.log(`[Sticker] A l'interieur de la fonction de rerender`);
    
            if (renderRet) {
              // On cherche le conteneur de badges/icônes
              const container = findInReactTree(renderRet, (x) => Array.isArray(x?.props?.children));
              if (container) {
                const children = container.props.children;
                if (!children.some((c: any) => c?.key === "sticker-key")) {
                  children.push(<GameSticker appId={appId} key="sticker-key" />);
          console.log(`[Sticker] Rendu patché pour l'AppID ${appId}`);
                }
              }
            }
            return renderRet;
          };
          
          TargetClass.prototype.render.__patched = true;
          wrapReactType(TargetClass);
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