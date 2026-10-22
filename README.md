<div align="center">

# 🌐 SyncVerse

### A real-time, multiplayer open world — authoritative server, zero-latency feel, AI-powered NPCs.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socketdotio&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-optional-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-optional-DC382D?logo=redis&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Render%20%2B%20Vercel-5eead4)

</div>

---

## ✨ What is SyncVerse?

SyncVerse is a **persistent shared world** where everyone who joins sees the same
things move in real time. It tackles the same class of problems behind Figma's
multiplayer cursors, Google Docs' concurrent editing and online game netcode:

- 🧠 **Server-authoritative state** — the server is the single source of truth.
- ⚡ **Client-side prediction** — your own moves feel instant; the server reconciles.
- 📦 **Delta broadcasting** — only what changed is sent, so bandwidth stays flat as the world grows.
- 🤖 **LLM-driven NPCs** — a "Guide" character listens to world chat and replies in character.

> It's systems engineering, not another CRUD app with a chat bolted on.

## 🎮 Features

| | Feature | Details |
|---|---|---|
| 🏃 | Real-time movement | WASD / arrow keys, server-validated, speed-clamped, bounds-checked |
| 💬 | Live world chat | Rate-limited, length-limited, broadcast to everyone in the world |
| 🔁 | Prediction + reconciliation | Replays unacknowledged inputs on top of the server's position |
| 📡 | Delta sync | Dirty-tracking per entity, flushed on a fixed 50 ms tick |
| 🤖 | AI NPC | Anthropic-powered, with per-NPC cooldown (enabled by `ANTHROPIC_API_KEY`) |
| 💾 | Persistence | Optional MongoDB snapshots + chat history |
| 📈 | Scaling path | Optional Redis adapter for multi-instance broadcast |
| ❤️ | Ops-ready | `/health` endpoint, graceful shutdown, multi-origin CORS |

## 🏗️ Architecture

```
┌─────────────┐        WebSocket (Socket.IO)        ┌──────────────────┐
│  Client A   │◄───────────────────────────────────►│                  │
│ (predicts   │      world:join / player:move       │   Node.js API    │
│  own moves) │    world:snapshot / world:delta     │   + Socket.IO    │
└─────────────┘      chat:send / chat:broadcast     │   Gateway        │
                                                    │                  │
┌─────────────┐                                     │  ┌────────────┐  │
│  Client B   │◄────────────────────────────────────┼─►│  GameLoop  │  │
└─────────────┘                                     │  │ (50ms tick)│  │
                                                    │  └─────┬──────┘  │
                                                    │  ┌─────▼──────┐  │
                                                    │  │ WorldState │  │
                                                    │  │ (entities, │  │
                                                    │  │ dirty set) │  │
                                                    │  └─────┬──────┘  │
                                                    └────────┼─────────┘
                              ┌──────────────────────────────┼──────────────┐
                              ▼                              ▼              ▼
                       ┌────────────┐                 ┌─────────────┐ ┌───────────┐
                       │  MongoDB   │                 │  NPC Agent  │ │   Redis   │
                       │ (snapshots,│                 │ (LLM-driven │ │ (multi-   │
                       │  chat log) │                 │  replies)   │ │ instance) │
                       └────────────┘                 └─────────────┘ └───────────┘
```

### Movement with prediction + reconciliation

```
Client                          Server
  │  player presses a key         │
  │  1. apply move locally now    │
  │  2. emit player:move {seq:12} │
  ├──────────────────────────────►│
  │                               │  validate + clamp + apply to WorldState
  │                               │  mark entity dirty, store lastSeq=12
  │        (next tick, 50ms)      │
  │◄──────────────────────────────┤  world:delta {updated:[...], lastSeq:12}
  │  reconcile:                   │
  │   • snap to server x,y        │
  │   • replay inputs with seq>12 │
  │  → feels instant, stays true  │
```

## 🧰 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Transport | Socket.IO | Reconnection + rooms out of the box |
| Simulation | Fixed-tick, server-authoritative loop | Decouples simulation from client FPS and network jitter |
| Backend | Node.js + Express | Natural fit for Socket.IO's event loop |
| Persistence | MongoDB (optional) | Periodic world snapshots + chat history |
| Scaling | Redis adapter (optional) | Broadcast across multiple server instances |
| Frontend | React + Canvas + Vite | Simple render loop, easy to swap for PixiJS/Three.js |
| AI | Anthropic Messages API (optional) | NPCs react to chat instead of following scripts |

## 📁 Project Structure

```
SyncVerse/
├── server/                     Node + Express + Socket.IO
│   ├── src/index.js            entrypoint (HTTP, sockets, Mongo/Redis, NPC)
│   ├── src/config.js           environment config
│   ├── src/network/            socket gateway (validation, rate limits, bounds)
│   ├── src/game/               WorldState, WorldRegistry, GameLoop
│   ├── src/ai/npcAgent.js      LLM NPC
│   ├── src/models/index.js     Mongoose models
│   └── test/                   node --test suites
├── client/                     React + Vite + Canvas
│   └── src/                    App, hooks/useWorldSocket, components, engine/renderWorld
├── docs/scaling.md             multi-instance scaling notes
├── render.yaml                 Render blueprint (server)
└── vercel.json                 Vercel config (client)
```

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/Dhanvanth1610/SyncVerse.git
cd SyncVerse
cp .env.example server/.env

# Terminal 1 — server (http://localhost:4000)
cd server && npm install && npm run dev

# Terminal 2 — client (http://localhost:5173)
cd client && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in **two tabs** and move around — you'll see each other live.

> MongoDB, Redis and the NPC are all optional. Without them the server runs in-memory with guest players.

## ⚙️ Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | server | `4000` | HTTP port |
| `TICK_RATE_MS` | server | `50` | Simulation tick interval |
| `CORS_ORIGIN` | server | `http://localhost:5173` | Allowed client origin(s), comma-separated (`*` = any) |
| `JWT_SECRET` | server | – | Enables JWT login; guest mode if unset |
| `MONGO_URI` | server | – | Enables persistence |
| `REDIS_URL` | server | – | Enables multi-instance broadcast |
| `ANTHROPIC_API_KEY` | server | – | Enables the Guide NPC |
| `NPC_MODEL` | server | `claude-haiku-5-5` | Model used by the NPC |
| `VITE_SERVER_URL` | client | `http://localhost:4000` | Server URL the client connects to |

## ☁️ Deployment

**1. Server → [Render](https://render.com)** (`render.yaml` included)
1. New → Blueprint → select this repo.
2. Set `CORS_ORIGIN` to your Vercel URL.
3. Health check path: `/health`.

**2. Client → [Vercel](https://vercel.com)** (`vercel.json` included)
1. Import the repo.
2. Set `VITE_SERVER_URL` to your Render URL (e.g. `https://syncverse-server.onrender.com`).
3. Deploy (redeploy after changing env vars).

> ⏳ Render's free tier sleeps when idle — the first connection can take ~30 s.
> Running more than one server instance? Set `REDIS_URL` and use sticky sessions — see [docs/scaling.md](docs/scaling.md).

## 🧪 Tests

```bash
cd server && npm test
```

## 🔌 Socket Protocol

| Direction | Event | Payload |
|---|---|---|
| client → server | `world:join` | `{ worldId }` |
| server → client | `world:snapshot` | `{ worldId, version, entities, selfId }` |
| client → server | `player:move` | `{ dx, dy, seq }` |
| server → client | `world:delta` | `{ worldId, version, updated, removed }` |
| client → server | `chat:send` | `{ text }` |
| server → client | `chat:broadcast` | `{ entityId, name, text, ts }` |

## 🗺️ Roadmap

- [ ] Real authentication (login / signup)
- [ ] Collision and world objects
- [ ] Redis-backed world state for horizontal scaling
- [ ] PixiJS renderer
- [ ] Mobile touch controls

## 🤝 Contributing

Issues and pull requests are welcome. Please run `npm test` in `server/` before submitting.

---

<div align="center">
Built with ❤️ using Node.js, Socket.IO and React
</div>
