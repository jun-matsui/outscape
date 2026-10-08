# 🌿 Outscape

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-orange?style=for-the-badge&logo=hacktoberfest)](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)
[![DEV Challenge](https://img.shields.io/badge/DEV%20Challenge-Week%201%3A%20Touch%20Grass-blueviolet?style=for-the-badge)](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Open Source AI](https://img.shields.io/badge/AI-Open--Weight%20Models-blue?style=for-the-badge)](https://ai.google.dev/gemma)

> **Disconnect from the screen. Reconnect with the wild.**  
> **画面を閉じて、自然とつながる。**

---

## 📖 Overview / 概要

### 🇬🇧 English
**Outscape** is an open-source outdoor navigation and nature exploration companion driven by open-weight AI. Designed specifically for the **DEV.to Hacktoberfest "Touch Grass" Challenge**, Outscape aims to make screen interaction the shortest part of your day.

Instead of keeping your eyes glued to a display while walking, hiking, or running, Outscape turns local environmental insights, seasonal highlights (like fall foliage or spring blooming), and trail discoveries into an immersive, **hands-free audio experience**. Put your phone in your pocket, listen to smart audio cues, and explore the outdoors with your senses wide open.

### 🇯🇵 日本語
**Outscape** は、オープンウェイト（オープンソース）AIを活用したハンズフリーの野外探索・音声ガイドコンパニオンです。**DEV.to Hacktoberfest「Touch Grass」チャレンジ**に向けて開発されました。

散歩やハイキング、ランニング中に画面を見つめ続けるのではなく、最小限の画面操作とスマートな音声ガイダンスによって、周囲の自然やトレイルの魅力を五感で体験できるよう設計されています。スマートフォンをポケットにしまい、自然の音に耳を傾けながら、外の世界へ踏み出しましょう。

---

## ✨ Key Features / 主な機能

- 🎧 **Hands-Free Audio Walk (ポケットの中のガイド)**: Real-time audio narration about trees, birds, local geography, and seasonal highlights without having to look down at your screen.
- 🤖 **Powered by Open-Weight AI (オープンウェイトAI搭載)**: Leverages open models (such as **Google Gemma 2**) to generate dynamic, contextual trail insights and nature prompts.
- 🔒 **Privacy-First & Edge-Ready (プライバシー重視・ローカル対応)**: Your GPS coordinates and movement data never leave your device for closed third-party ad networks.
- 🍂 **Seasonal & Biome Aware (季節・地域に合わせた探索)**: Focuses on outdoor activities like fall foliage walks, park tours, flower spotting, and local green corridors.
- ⚡ **Lightweight PWA / Web Experience (軽量で即座に起動)**: Fast, mobile-first design built with clean modern web standards.

---

## 💡 Why Open Innovation Matters / オープンイノベーションの意義

When exploring outdoors, closed proprietary AI APIs come with severe downsides:
1. **Connectivity Issues in Nature:** Cellular reception on trails, mountains, or remote parks is often unreliable or non-existent. Open models can run on device or on self-hosted lightweight edges.
2. **Location Privacy:** Outdoor routes and daily habits are sensitive personal data. Open-source solutions ensure your private trail tracks are never monetized or stored on opaque servers.
3. **Zero Cost & Community Customization:** Local birdwatchers, trail clubs, and botanical societies can freely adapt, fine-tune, or customize the model's domain knowledge without incurring prohibitive per-token API charges.

---

## 🛠️ Tech Stack / 技術スタック

- **Frontend:** Modern HTML5, Vanilla CSS / Tailwind tokens, JavaScript (ESModules)
- **Audio & TTS Engine:** Web Speech API / ElevenLabs Audio Streaming / Open TTS
- **AI Core:** Open-weight LLM (Gemma 2) via local inference runtime / lightweight microservice
- **Geolocation & Mapping:** HTML5 Geolocation API, OpenStreetMap / Leaflet

---

## 🚀 Quick Start / クイックスタート

```bash
# Clone the repository
git clone https://github.com/jun-matsui/outscape.git
cd outscape

# Start local development server (e.g. via python or vite/npx)
npx -y serve .
```

---

## 🤝 Hacktoberfest 2026 Participation

This project is created as an official submission for:
- **Challenge:** [Hacktoberfest Open-Source AI Challenge: Week 1 (Touch Grass)](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)
- **Target Categories:** 
  - *Main Theme: Touch Grass*
  - *Best Use of Gemma (Open-Weight Model)*
  - *Best Use of Render / ElevenLabs*

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
