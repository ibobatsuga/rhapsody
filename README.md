# 🎵 Rhapsody — Next-Gen Web DAW & AI Music Studio

**Rhapsody** adalah aplikasi Digital Audio Workstation (DAW) berbasis web modern (terinspirasi dari arsitektur BandLab) yang dilengkapi dengan **AI Studio Assistant** (generator musik & stem menggunakan **Suno AI** dan **Udio AI** via **GoAPI**) sebagai fitur tambahan terintegrasi.

---

## 🌟 Fitur Utama Rhapsody

### 1. 🎛️ Multitrack Web DAW Timeline (Inti DAW)
* **Master Transport Bar**: Play, Pause, Stop, Rewind, Loop toggle, Timecode counter presisi milidetik.
* **Audio Clock & BPM Engine**: Pengaturan tempo (BPM) dengan sinkronisasi clock WebAudio 44.1kHz.
* **Track Kontrol Individual**:
  * Solo (S) & Mute (M) per-track.
  * Volume Fader (dB) & Stereo Panner (-100% L s/d +100% R).
  * Color coding visual & Track renaming/deletion.
* **Interactive Timeline Grid**:
  * Ruler dengan pembagian Bar/Beat musikal.
  * Click-to-seek playhead seketika.
  * Interactive audio waveform clips dengan durasi akurat.
  * Penambahan track tanpa batas (Audio, Synth, Drums).

### 2. 🤖 AI Studio Assistant (Fitur Tambahan: Suno & Udio via GoAPI)
* **Addon Flyout Drawer**: Tidak mengganggu alur kerja DAW, dapat dibuka/tutup kapan saja melalui tombol `✨ AI Assistant`.
* **Dua Model AI Pilihan**:
  * **Suno AI** (v3.5 / v4): Ahli dalam aransemen vokal, struktur lagu, dan variasi melodi.
  * **Udio AI** (v1.5): Ahli dalam kejernihan fidelity instrumen dan harmoni kompleks.
* **Mode Pembuatan**:
  * *Simple Mode*: Prompt deskriptif cepat (misal: *"Synthwave arpeggio 120bpm"*).
  * *Custom Mode*: Input judul, tags gaya musik, dan lirik manual.
  * *Instrumental Switch*: Pilihan musik murni tanpa vokal.
* **Workflow "Add to Timeline"**:
  * Audio hasil generate dapat diputar langsung di panel preview.
  * **Satu klik "Add to Timeline"**: Audio otomatis di-decode ke WebAudio buffer dan dimasukkan sebagai track baru di timeline DAW!
  * **"Split Stems"**: Otomatis memecah lagu hasil generate menjadi 2 track terpisah di DAW: **Track Vokal** & **Track Instrumental**.
* **Zero-Friction Simulation Mode**: Jika belum memasukkan GoAPI key, sistem tetap dapat menghasilkan audio loop sintetis real-time untuk testing seketika.

### 3. 🎹 Instrumen & Efek Built-in (Web Audio Synthesis)
* **16-Pad Drum Machine**: Kick, Snare, Hi-Hat, 808 Bass, Clap disintesis langsung tanpa jeda unduhan.
* **Polyphonic Synthesizer**: Keyboard piano 2-oktaf interaktif dengan pilihan gelombang (Sawtooth, Square, Triangle, Sine) dan kontrol transposer oktaf.
* **DSP Effects Rack**: Filter frekuensi parametrik (Lowpass, Highpass, Bandpass) dengan sweep cutoff real-time.

---

## 🚀 Cara Menjalankan Rhapsody

Buka terminal dan masuk ke folder proyek:

```bash
cd /Users/ibobatsuga/.gemini/antigravity/scratch/rhapsody
```

Jalankan perintah berikut:

```bash
npm run dev
```

Perintah ini akan menjalankan:
1. **Backend Server** di `http://localhost:3001` (Relay GoAPI & Audio CORS Proxy).
2. **Frontend DAW** di `http://localhost:5173`.

Buka browser Anda di:
👉 **`http://localhost:5173`**

---

## 🔑 Konfigurasi GoAPI Key (Opsional)

1. Buka aplikasi Rhapsody di browser.
2. Klik ikon gerigi **Settings (⚙️)** di pojok kanan atas.
3. Masukkan `X-API-Key` GoAPI Anda.
4. Klik **Save Configuration** (tersimpan aman di `localStorage` browser Anda).
5. Jika tanpa API key, Rhapsody akan otomatis menggunakan *Simulation Mode* berkecepatan tinggi dengan loop instrumen terintegrasi.
