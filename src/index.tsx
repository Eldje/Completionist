import {
  definePlugin,
  ServerAPI,
} from "decky-frontend-lib";
import React, { useState, FC } from "react";

// On définit le composant de contenu de manière très simple
const Content: FC<{ api: ServerAPI }> = ({ api }) => {
  const [msg, setMsg] = useState("Prêt");

  const callPython = async () => {
    setMsg("Appel en cours..."); // Pour confirmer que le clic fonctionne
    try {
      // Correction ici : on utilise 'api' (passé en props) et non 'serverApi'
      const res = await api.callPluginMethod("get_status", {});
      
      if (res.success) {
          // Decky place le retour du Python dans res.result
          // Si ton Python renvoie un dictionnaire {"data": "..."}
          const data = res.result?.data || JSON.stringify(res.result);
          setMsg(`Succès : ${data}`);
      } else {
          setMsg(`Erreur : ${res.error || "Réponse False"}`);
      }
    } catch (e) {
      setMsg(`Crash JS : ${String(e)}`);
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <p style={{ color: "white", marginBottom: "10px" }}>{msg}</p>
      <button 
        onClick={callPython}
        style={{ width: "100%", padding: "5px" }}
      >
        Tester Python
      </button>
    </div>
  );
};

// L'exportation doit être la plus simple possible pour Steam
export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: "Completionist", // String pure, pas de JSX
    content: <Content api={serverApi} />,
    icon: undefined, // On retire l'icône pour l'instant
    onDismount() {}
  };
});