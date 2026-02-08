import { Focusable } from "@decky/ui";
// Note : React est importé via SP_REACT dans tes fichiers de patches si nécessaire
// Ici on suppose une intégration standard dans le composant

interface GameStickerProps {
  appId: number;
  variant: "banner" | "capsule";
}

export const GameSticker = ({ appId, variant }: GameStickerProps) => {
  
  const isBanner = variant === "banner";

  const handleUpdate = (e?: any) => {
    e?.stopPropagation();
    console.log(`[Completionist] LOG 10: Manual update requested for AppID ${appId}`);
    
    // Utilisation de 'call' comme demandé dans vos instructions
    // @ts-ignore (si call n'est pas encore typé globalement)
    window.call("refresh_game_data", { appid: appId });
  };

  const commonStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "10px",
    zIndex: 100,
  };

  // COMPORTEMENT 1 : Vue Détails (Focusable et Cliquable)
  if (isBanner) {
    return (
      <Focusable
        style={{ ...commonStyle, cursor: "pointer", pointerEvents: "all" }}
        onClick={handleUpdate}
        // Pour la navigation Manette/Joystick (Bouton A)
        onButtonDown={(e: any) => {
          if (e.detail.button === 0) handleUpdate(e);
        }}
      >
        <div className="sticker-content" style={{ padding: "5px", background: "rgba(0,0,0,0.5)", borderRadius: "4px" }}>
          🏆
        </div>
      </Focusable>
    );
  }

  // COMPORTEMENT 2 : Capsules (Simple affichage, invisible pour le joystick)
  return (
    <div style={{ ...commonStyle, pointerEvents: "none" }}>
      <div className="sticker-content">
        🏆
      </div>
    </div>
  );
};