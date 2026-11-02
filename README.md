# 🎵 Rhapsody — AI Music Creation Platform (Suno & Udio Powered)

**Rhapsody** adalah platform kreasi dan streaming musik AI mutakhir yang mengadopsi struktur tampilan, menu, alur kerja, dan fungsionalitas mirip **Suno.com**, ditenagai oleh model generasi musik **Suno AI** (v3.5 / v4) dan **Udio AI** (v1.5) via gateway GoAPI.

---

## 🌟 Fitur & Layout Ala Suno.com

### 1. 🧭 Navigasi & Sidebar Kiri (Suno Layout)
* **Brand & Identity**: Logo Rhapsody AI dengan aksen gradasi neon flame.
* **Menu Utama**:
  * **Create**: Panel kreasi musik split-screen (form kreasi di kiri, live feed lagu yang dihasilkan di kanan).
  * **Explore**: Halaman penemuan musik trending komunitas, pill filter genre (*Synthwave, Lo-Fi, Cyberpunk, Acoustic, EDM*), dan pencarian instan.
  * **Library**: Koleksi seluruh lagu buatan pengguna, filter lagu favorit (*Liked Songs*), dan hasil pemisahan stem (*Split Stems*).
* **Credits Tracker**: Indikator kredit harian (50/50) dengan progress bar visual.
* **GoAPI Settings**: Modal konfigurasi `X-API-Key` GoAPI untuk generasi live tak terbatas.

### 2. 🎛️ Panel Kreasi Musik (Create View)
* **Simple Mode**: Cukup tulis deskripsi lagu (contoh: *"Synthwave 80s anthem speeding through neon city highways"*).
* **Custom Mode**:
  * **AI Lyrics Generator**: Tombol "Make Random Lyrics" untuk merangkai lirik terstruktur (*Verse 1, Chorus, Verse 2, Outro*).
  * **Style of Music**: Input genre dan tag musik dengan bantuan chip populer (+lo-fi, +synthwave, dll).
  * **Title Input**: Kustomisasi judul track.
* **Model Engine Selector**:
  * **Suno v4**: Model generasi audio fidelity tinggi dengan melodi emosional.
  * **Suno v3.5**: Model kreasi lagu cepat dengan variasi hook dinamis.
  * **Udio 1.5**: Model harmoni kompleks dan kedalaman tekstur instrumen.
* **Instrumental Switch**: Toggle untuk membuat musik murni tanpa vokal vokal.
* **Cost**: 5 kredit per generasi dengan feedback status live real-time.

### 3. ✂️ Pemisahan Stem AI (Multitrack Stems)
* Memisahkan lagu menjadi dua track terisolasi:
  * **Vocal Stem (Acapella)**: Suara vokal utama & harmoni bersih.
  * **Instrumental Stem (Backing Track)**: Drum, bass, synth, dan instrumen pengiring.
* Fitur pratinjau audio mandiri dan tombol unduh langsung (*Download MP3*).

### 4. 📻 Bottom Sticky Audio Player (Persistent Player Bar)
* **Kontrol Pemutaran**: Play/Pause, Previous, Next, Loop toggle, dan volume fader dengan mute switch.
* **Interactive Scrubber**: Slider posisi lagu real-time dengan counter detik/menit presisi.
* **Lyrics Karaoke View**: Modal tampilan lirik interaktif dengan blok verse/chorus terformat dan tombol "Copy Lyrics".
* **Ekspor Audio**: Tombol unduh file MP3 langsung dari player.

---

## 🚀 Menjalankan Rhapsody

```bash
# Masuk ke direktori
cd /Users/ibobatsuga/.gemini/antigravity/scratch/rhapsody

# Jalankan server frontend & backend
npm run dev

# Jalankan Zero-Failure Security & API Test Suite
node --test tests/system_audit.test.mjs
```

---

## 🛡️ Arsitektur Keamanan & Zero-Defect
* **SSRF Protection**: Mencegah request proxy ke IP internal / private (RFC 1918) dan loopback.
* **Rate Limiting**: Sliding window 30 req/min untuk melindungi API gateway dari flooding.
* **Payload Boundary**: Validasi prompt teks maksimal 2.000 karakter.
* **Simulation Mode Fallback**: Tetap berfungsi penuh untuk demonstrasi visual dan preview audio jika pengguna belum memasukkan API key.
