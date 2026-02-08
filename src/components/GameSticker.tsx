const React = (window as any).SP_REACT;

interface StickerProps {
  appId: number;
  variant: "banner" | "capsule";
}

/**
 * Shared Sticker Component.
 * variant "banner": Bottom-right for Game Detail.
 * variant "capsule": Top-right for Library.
 */
export const GameSticker = React.memo(({ appId, variant }: StickerProps) => {
  console.log(`[Completionist] LOG 10: Rendering Sticker (${variant}) for App ${appId}`);

  const styles: any = variant === "banner" 
    ? { bottom: "10px", right: "10px", padding: "6px 12px", fontSize: "14px" }
    : { top: "5px", right: "5px", padding: "2px 6px", fontSize: "10px" };

  return (
    <div style={{
      position: "absolute",
      backgroundColor: "#1a9fff",
      color: "white",
      borderRadius: "4px",
      zIndex: 9999,
      border: "1px solid rgba(255,255,255,0.4)",
      fontWeight: "bold",
      boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
      pointerEvents: "none",
      ...styles
    }}>
      ID: {appId}
    </div>
  );
}) as any;