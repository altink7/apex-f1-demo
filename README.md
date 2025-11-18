
# 🏎️ APEX F1 - Intelligent Racing Hub

![License](https://img.shields.io/badge/License-MIT-red.svg)
![React](https://img.shields.io/badge/React-19.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-cyan)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5-purple)
![Design](https://img.shields.io/badge/Designed_By-Altin_Kelmendi-gold)

> **The ultimate Formula 1 companion app featuring real-time AI analysis, interactive track exploration, and comprehensive telemetry.**

---

## 🏁 Overview

**ApexF1** is a next-generation racing dashboard that blends live F1 data with the power of Generative AI. Unlike standard stats apps, ApexF1 uses **Google Gemini 2.5** to provide context, strategy predictions, and deep historical insights instantly.

Designed with a "Dark Mode" racing aesthetic by **Altin Kelmendi**, this application is built for speed, visual impact, and depth.

---

## 🚀 Key Features

### 1. 🧠 AI-Powered Intelligence
*   **Pre-Race Strategy:** The app analyzes the next Grand Prix location and generates a concise strategy report using Gemini 2.5 Flash.
*   **Driver Deep Dives:** Click on any driver to get an AI-generated summary of their current form, driving style, and outlook for the next race.

### 2. 🌍 Track Intel & Grounding
*   **Interactive Maps:** Powered by Pigeon Maps and Google Maps Grounding.
*   **Real-Time Coordinates:** Navigate the globe to every circuit on the calendar.
*   **AI Reports:** Get detailed layouts, DRS zone info, and historical context generated on the fly.

### 3. 🏎️ The Circuit Gallery
*   **Visual Carousel:** A stunning horizontal scroll of every track on the calendar.
*   **Flappable Sections:**
    *   **📊 Results:** Most recent GP results for that track.
    *   **🗺️ Map:** Fullscreen interactive track layout.
    *   **🎥 Onboard:** Embedded hot-lap videos for the specific circuit.
    *   **🏆 Records:** AI-fetched Lap Records and "Most Wins" history.

### 4. 📈 Live Standings & Telemetry
*   **Dynamic Charts:** Visual bar charts for Driver and Constructor points.
*   **Grid View:** Detailed breakdown of wins, points, and rankings.
*   **Real Photos:** High-quality images of drivers and tracks fetched dynamically from Wikipedia.

---

## 🛠️ Under the Hood

This project relies on a modern, high-performance tech stack:

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | React 19 (Vite) | Core application framework |
| **Styling** | Tailwind CSS | Responsive, racing-themed UI |
| **AI Engine** | Google Gemini SDK | Text generation, JSON structured output, Grounding |
| **Maps** | Pigeon Maps | Lightweight React mapping |
| **Data Source** | Ergast API (Jolpi) | Historical F1 data and schedules |
| **Visuals** | Wikipedia API | Dynamic fetch of driver/track photos |

---

## 🏎️ Design Philosophy

> *"Speed isn't just about the car; it's about how fast you can understand the race."*

**Designed by Altin Kelmendi**, the UI focuses on:
*   **Contrast:** High-contrast 'Racing Red' against 'Charcoal' backgrounds for readability.
*   **Typography:** Uses `Titillium Web`, a font synonymous with high-performance motorsport.
*   **Glassmorphism:** Subtle semi-transparent overlays for a modern, premium feel.

---

## 🔧 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/apexf1.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up API Keys**
    Create a `.env` file and add your Google Gemini API Key:
    ```env
    API_KEY=your_google_gemini_key_here
    ```

4.  **Start the engine**
    ```bash
    npm start
    ```

---

## 📸 Screenshots

| Dashboard | Track Intel |
|:---:|:---:|
| ![Dashboard Placeholder](https://via.placeholder.com/400x200/15151E/E10600?text=Dashboard+View) | ![Map Placeholder](https://via.placeholder.com/400x200/15151E/E10600?text=Track+Intel) |

---

⭐ **Star this repo if you love F1!**
