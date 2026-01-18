import {
  definePlugin,
  ServerAPI,
  staticRender,
} from "decky-frontend-lib";
import { useState, VFC } from "react";
import { FaBug } from "react-icons/fa";

const Content: VFC<{ serverApi: ServerAPI }> = ({ serverApi }) => {
  const [rawResponse, setRawResponse] = useState<string>("No data yet");

  const runDiagnostic = async () => {
    setRawResponse("Calling Python...");
    try {
      const res = await serverApi.callPluginMethod("get_local_games", {});
      
      // On convertit l'objet complet en texte pour le voir à l'écran
      // indenté avec 2 espaces pour la lisibilité
      const jsonString = JSON.stringify(res, null, 2);
      setRawResponse(jsonString);
      
    } catch (e) {
      setRawResponse(`RPC Error: ${String(e)}`);
    }
  };

  return (
    <div style={{ padding: "10px", color: "white" }}>
      <button 
        onClick={runDiagnostic} 
        style={{ 
          backgroundColor: "#3d4450", 
          padding: "8px", 
          borderRadius: "4px",
          marginBottom: "10px" 
        }}
      >
        🔍 Run Backend Diagnostic
      </button>

      <div style={{ marginTop: "10px" }}>
        <p><strong>Raw Backend Output:</strong></p>
        <pre style={{ 
          backgroundColor: "#1a1b1e", 
          padding: "10px", 
          borderRadius: "5px", 
          fontSize: "10px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all"
        }}>
          {rawResponse}
        </pre>
      </div>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className="static-auth-title">completionist DEBUG</div>,
    content: <Content serverApi={serverApi} />,
    icon: <FaBug />,
  };
});