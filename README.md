# AuraCode ✨

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

**AuraCode** is a next-generation, intelligent code editor designed for the modern developer. It lives in your browser and combines a minimalist, distraction-free aesthetic with a powerful, AI-driven feature set, creating the perfect environment for learning, prototyping, and problem-solving.

> ⚠️ *It is highly recommended to replace the static image with an animated GIF showcasing the AI features, tabbed interface, and code execution.*

---

## 🧠 Core Philosophy

Our goal with AuraCode is to create a coding environment that is not just functional, but a **joy to use**. We believe in **Intentional Minimalism**—every feature serves a purpose, and complexity is revealed only when needed. The AI is designed to be a true programming partner, helping you understand and debug code, not just write it.

---

## 🚀 Key Features

### 📝 The Editor Experience

* **Monaco Editor Core**: Experience the world-class editor that powers VS Code, with syntax highlighting, IntelliSense, and error validation.
* **Multi-Language Sandbox**: Write, run, and test code in various popular languages—**right in your browser**.
* **True In-Browser Execution**:

  * **Native**: JavaScript, HTML/CSS
  * **WebAssembly**: Python (via Pyodide)
  * **Transpilation**: TypeScript
  * *(Planned)* Backend execution for Rust, C/C++, Go
* **Tabbed Interface**: Work on multiple files with a clean, IDE-like experience.
* **Command Palette**: Quickly access actions with `Cmd/Ctrl + K`.
* **Beautiful UI**: A dark, elegant interface built with Tailwind CSS.

---

### 🤖 AI Assistant (Powered by Google Gemini)

* **Explain Selection**: Highlight code and get detailed explanations.
* **Smart Debugging**: AI analyzes errors and suggests fixes.
* **Floating Context Menu**: AI tools right where you need them.

---

### 🗂️ Intelligent Workspace

* **Multi-File Support**: Create, rename, and delete files/folders.
* **Language Detection**: Auto-detects language via file extensions.
* **Local Session Persistence**: Workspace auto-saved and restored via local storage.

---

## 🛠️ Technology Stack

| Layer       | Tech                          |
| ----------- | ----------------------------- |
| Frontend    | React, TypeScript, Vite       |
| Styling     | Tailwind CSS                  |
| Code Editor | Monaco Editor                 |
| AI          | Google Gemini API             |
| Python      | Pyodide (WebAssembly runtime) |

---

## 🏋️ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* npm / pnpm / yarn

### Installation

1. **Clone the repository:**

```sh
git clone https://github.com/your-username/AuraCode.git
cd AuraCode
```

2. **Install dependencies:**

```sh
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
```

4. **Run the development server:**

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to start using AuraCode.

---

## 🗐️ Future Roadmap

* ☁️ User Accounts & Cloud Sync
* 🔗 Sharable Snapshots
* 🧑‍🤝‍🧑 Real-Time Collaboration
* 🧠 Advanced AI Refactoring
* 🎨 Theme Customization
* ⚙️ Backend Compilation for Rust, C/C++, Go

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn and grow.

* Open an issue to propose features or improvements.
* Fork and submit a pull request to contribute directly.

---

## 📄 License

Distributed under the **MIT License**.
See [`LICENSE`](./LICENSE) for more information.
