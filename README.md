# 💧 Smart IV Drip Monitoring System

A real-time IoT-based IV drip monitoring system that tracks fluid levels using a load cell sensor, displays data on a TFT screen, and streams live updates to a web dashboard via MQTT.

Built with **ESP32**, **HX711 Load Cell**, **ILI9341 TFT Display**, and a **Web Dashboard**.

---

## 📌 Features

- **Real-time weight monitoring** using HX711 load cell (5 kg)
- **On-device TFT display** showing weight, capacity bar, min/max stats, and connection status
- **Live web dashboard** with animated fluid-level bottle visualization
- **Multi-level alarm system** — color-coded warnings at 50%, 25%, and 10% fluid levels
- **Audio alert** — browser beep alarm when fluid drops below 10%
- **MQTT communication** over TLS (HiveMQ Cloud) between device and dashboard
- **Fully simulatable** on [Wokwi](https://wokwi.com) — no hardware required to test

---

## 🏗️ System Architecture

```
┌─────────────────────┐        MQTT (TLS)        ┌─────────────────────┐
│      ESP32 +        │  ───────────────────────► │                     │
│   HX711 Load Cell   │   smartscale/weight       │   Web Dashboard     │
│   ILI9341 Display   │                           │   (HTML/CSS/JS)     │
│                     │        HiveMQ Cloud       │                     │
└─────────────────────┘        (Broker)           └─────────────────────┘
```

---

## 🔧 Hardware Components

| Component | Purpose |
|---|---|
| ESP32 DevKit C V4 | Microcontroller with WiFi |
| HX711 + 5 kg Load Cell | Measures IV bag weight |
| ILI9341 2.4" TFT Display | On-device status display |

### Pin Configuration

| ESP32 Pin | Connected To |
|---|---|
| GPIO 16 | HX711 DT |
| GPIO 4 | HX711 SCK |
| GPIO 15 | TFT CS |
| GPIO 17 | TFT D/C |
| GPIO 2 | TFT RST |
| GPIO 23 | TFT MOSI |
| GPIO 18 | TFT SCK |
| GPIO 19 | TFT MISO |
| 3V3 | HX711 VCC, TFT VCC, TFT LED |
| GND | HX711 GND, TFT GND |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Firmware | Arduino (C++) on ESP32 |
| Sensor | HX711 library |
| Display | Adafruit ILI9341 + GFX |
| Communication | MQTT over TLS (PubSubClient) |
| Broker | HiveMQ Cloud (free tier) |
| Web Frontend | HTML, CSS, JavaScript |
| MQTT Client (Web) | mqtt.js over WebSocket |
| Simulation | Wokwi |

---

## 🚀 Getting Started

### 1. Set Up MQTT Broker

1. Create a free account at [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
2. Create a cluster and note down the **host URL**
3. Create MQTT credentials (username and password)

### 2. Flash the Firmware

1. Open `source_code/sketch.ino` in Arduino IDE
2. Install the required libraries:
   - `HX711` by Bogdan Necula
   - `Adafruit ILI9341`
   - `Adafruit GFX`
   - `PubSubClient` by Nick O'Leary
3. Update the MQTT credentials in the sketch:
   ```cpp
   const char* mqttServer = "YOUR_HIVEMQ_HOST";
   const char* mqttUser = "YOUR_USERNAME";
   const char* mqttPassword = "YOUR_PASSWORD";
   ```
4. Select board **ESP32 Dev Module** and upload

### 3. Run the Web Dashboard

1. Update the MQTT credentials in `script.js`:
   ```js
   const host = "YOUR_HIVEMQ_HOST";
   const username = "YOUR_USERNAME";
   const password = "YOUR_PASSWORD";
   ```
2. Open `index.html` in a browser

### 4. Simulate on Wokwi (No Hardware Needed)

1. Go to [wokwi.com](https://wokwi.com)
2. Create a new ESP32 project
3. Import `source_code/sketch.ino`, `source_code/diagram.json`, and `source_code/wokwi.toml`
4. Run the simulation

---

## 📁 Project Structure

```
Smart-IV-Drip/
├── index.html              # Web dashboard
├── style.css               # Dashboard styles
├── script.js               # MQTT client & UI logic
├── source_code/
│   ├── sketch.ino          # ESP32 firmware
│   ├── diagram.json        # Wokwi circuit diagram
│   └── wokwi.toml          # Wokwi config
├── LICENSE
└── README.md
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">


**Made with ❤️ by Ashish**

</div>