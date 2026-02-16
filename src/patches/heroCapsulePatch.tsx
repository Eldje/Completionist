import { afterPatch } from "@decky/ui";
import { GameSticker } from "../components/GameSticker";

const React = (window as any).SP_REACT;

export const initHeroCapsulePatch = () => {if (!React) return undefined;

  // We patch createElement to "catch" the new component function 
  // as soon as Steam tries to swap to the "Mouse Mode" version.
  return afterPatch(React, "createElement", (_args, ret: any) => {
    const props = ret?.props;
    const appId = props?.app?.appid || props?.appid;

    if (appId && props?.["aria-labelledby"]) {
      const Target = ret.type;

      // If it's a function (Functional Component), we wrap it 
      // so it always returns our badge, no matter the mode.
      if (typeof Target === 'function' && !Target.__patched) {
        ret.type = (componentProps: any) => {
          const res = Target(componentProps);
          return injectSticker(res, appId);
        };
        ret.type.__patched = true;
      }
    }
    return ret;
  });
};

const injectSticker = (res: any, appId: number) => {
  if (!res?.props) return res;
  const sticker = <GameSticker appId={appId} variant="capsule" />;
  const children = res.props.children;
  
  // High-performance injection: ensure we don't cause infinite re-renders
  res.props.children = Array.isArray(children) ? [...children, sticker] : [children, sticker];
  return res;
};