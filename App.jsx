import { useWorldSocket } from "./hooks/useWorldSocket.js";
import { WorldCanvas } from "./components/WorldCanvas.jsx";
import { ChatOverlay } from "./components/ChatOverlay.jsx";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
const WORLD_ID = "lobby";

export default function App() {
  const { entities, selfId, chatLog, connected, move, sendChat } = useWorldSocket({
    url: SERVER_URL,
    worldId: WORLD_ID,
  });

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", color: "#e5e7eb" }}>
      <h2 style={{ margin: "0 0 4px" }}>SyncVerse — Live World</h2>
      <p style={{ margin: "0 0 16px", color: "#9ca3af", fontSize: 13 }}>
        {connected ? `Connected — ${Object.keys(entities).length} entities online` : "Connecting…"} · WASD/Arrows to move
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        <WorldCanvas entities={entities} selfId={selfId} onMove={move} />
        <ChatOverlay chatLog={chatLog} onSend={sendChat} />
      </div>
    </div>
  );
}
