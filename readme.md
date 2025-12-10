# Turn Undone: Echoes of the Last Move

**Turn Undone: Echoes of the Last Move** is a turn-based RPG prototype inspired by classic JRPG design, built for the modern web.  
Every action leaves a consequence. Every turn creates an echo.

This project emphasizes **tactical planning**, **delayed effects**, and **meaningful decisions**, instead of real-time reflexes.

---

## 🎮 Core Concept

In *Turn Undone*, combat is not limited to the current turn.

Actions taken now will influence future turns through an **Echo system**.  
Players must think ahead and manage long-term consequences.

> One move may win the turn.  
> The echo decides the battle.

---

## 🧠 Key Features

- **Turn-Based Combat**
  - Classic player–enemy turn order
  - Strategy-focused and deterministic

- **Echo System (Core Mechanic)**
  - Actions create delayed effects that trigger on future turns
  - Example mechanics:
    - Heavy attacks reduce defense next turn
    - Powerful magic delays MP recovery
    - Strong heals cause temporary fatigue

- **JRPG-Inspired Gameplay**
  - Small party battles
  - HP / MP resource management
  - Skill-driven combat choices

- **Web-Native Experience**
  - Runs entirely in the browser
  - No installation required

---

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Bundler**: Vite
- **Language**: TypeScript
- **Game Framework**: Phaser 3
- **Rendering**: Canvas / WebGL
- **Deployment**: Vercel (static build)

---

## 📁 Project Structure

```

phaser-rpg/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
├── main.ts          # Phaser bootstrap
├── BattleScene.ts   # Turn-based battle system
└── (future scenes)

````

---

## 🚀 Getting Started

### Requirements
- Bun (latest stable)

### Run in Development

```bash
bun install
bun run dev
````

Open the URL provided by Vite (typically `http://localhost:5173`).

---

### Build for Production

```bash
bun run build
```

The production-ready static files will be generated in the `dist/` directory.

---

## 🌐 Deployment

Optimized for static hosting.

Recommended setup for **Vercel**:

* Install command: `bun install`
* Build command: `bun run build`
* Output directory: `dist`

---

## 🧩 Roadmap

* ✅ Core turn-based battle prototype
* ✅ Player & enemy combat loop
* ⏳ Echo System (delayed effects)
* ⏳ Multiple enemies & party members
* ⏳ Status effects (poison, stun, fatigue)
* ⏳ World / encounter scenes
* ⏳ Save & progression system

---

## 📌 Design Philosophy

* Small scope, deep mechanics
* Fewer features, stronger identity
* Strategy over speed
* Consequence-driven gameplay

---

## 📄 License

MIT License.

This project is intended as:

* a learning experiment
* a portfolio showcase
* a foundation for a full JRPG concept

```
```
