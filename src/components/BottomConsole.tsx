import React, { useState, useEffect, useRef } from 'react';
import { audioEngine, EQ_FREQUENCIES } from '../audio/audioEngine';
import { Track, AIGenerationResult } from '../types';
import { Play, Pause, Plus, MoreHorizontal, Sparkles } from 'lucide-react';

interface BottomConsoleProps {
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  tracks: Track[];
  selectedTrackId: string | null;
  onOpenAIAssistant: () => void;
  onAddSampleToTrack: (title: string, genre: string, color: string) => void;
}

export const BottomConsole: React.FC<BottomConsoleProps> = ({
  masterVolume,
  onMasterVolumeChange,
  tracks,
  selectedTrackId,
  onOpenAIAssistant,
  onAddSampleToTrack
}) => {
  // DSP Knob values
  const [memoryPreset, setMemoryPreset] = useState(7);
  const [valueKnob, setValueKnob] = useState(55);
  const [gainKnob, setGainKnob] = useState(65);
  const [levelKnob, setLevelKnob] = useState(70);
  const [reverbKnob, setReverbKnob] = useState(40);

  // 10-Band Graphic EQ Fader values (-12dB to +12dB)
  const [eqGains, setEqGains] = useState<number[]>([
    2, -1, 3, 0, -2, 1, 4, 2, 5, 3
  ]);

  // Channel & Memory selectors
  const [activeChannel, setActiveChannel] = useState<'A' | 'B'>('A');
  const [activeMemorySlot, setActiveMemorySlot] = useState(1);

  // Live Oscilloscope Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Sample Banks list matching the image
  const samplePacks = [
    {
      id: 'hiphop',
      title: 'Collection Hip',
      genre: 'Hip Hop',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop',
      color: '#00f5d4'
    },
    {
      id: 'drbeats',
      title: 'Dr. Beats',
      genre: 'Underworld',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&h=80&fit=crop',
      color: '#ff9e00'
    },
    {
      id: 'jazz',
      title: 'Ultimate Jazz',
      genre: 'Jazz Pack',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=80&h=80&fit=crop',
      color: '#9d4edd'
    },
    {
      id: 'ai_suno',
      title: 'AI Stem Generator',
      genre: 'Suno & Udio Stems',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop',
      color: '#e63946',
      isAi: true
    }
  ];

  // Handle EQ Slider Changes
  const handleEqChange = (index: number, val: number) => {
    const next = [...eqGains];
    next[index] = val;
    setEqGains(next);
    audioEngine.setEqBandGain(index, val);
  };

  // Live Oscilloscope / Audio Spectrum Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 256;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      audioEngine.getWaveformData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle dark grid
      ctx.fillStyle = '#0b0e12';
      ctx.fillRect(0, 0, width, height);

      // Draw Center Baseline
      ctx.strokeStyle = '#182028';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Glowing Neon Green / Teal Audio Oscilloscope Wave
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#38ef7d';
      ctx.shadowColor = '#38ef7d';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="h-64 bg-[#11151a] border-t border-[#1e2630] flex select-none text-gray-300 z-10">
      {/* ============================================================ */}
      {/* 1. MASTER VOLUME CONTROL BAY (Far Left)                       */}
      {/* ============================================================ */}
      <div className="w-28 min-w-[112px] p-3 border-r border-[#1e2630] flex flex-col justify-between items-center bg-[#11151a]">
        <span className="text-[9px] font-mono tracking-wider uppercase text-gray-500 font-bold">
          VOLUME CONTROL
        </span>

        {/* Dual Vertical Faders (L & R Channel) with VU Meters */}
        <div className="flex items-center gap-3 my-2">
          {/* Left Channel Fader & Meter */}
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-36 bg-[#090c0f] rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-[#1e2630]">
              <div 
                className="w-full bg-gradient-to-t from-[#38ef7d] via-[#00f5d4] to-[#e63946] rounded-full"
                style={{ height: `${Math.round(masterVolume * 75)}%` }}
              />
            </div>
            <div className="relative h-36 flex items-center">
              <input 
                type="range"
                min="0"
                max="1.2"
                step="0.01"
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                className="w-36 h-2 appearance-none bg-[#090c0f] border border-[#232c36] rounded-full cursor-pointer -rotate-90 origin-center accent-white"
              />
            </div>
          </div>

          {/* Right Channel Fader & Meter */}
          <div className="flex items-center gap-1">
            <div className="relative h-36 flex items-center">
              <input 
                type="range"
                min="0"
                max="1.2"
                step="0.01"
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                className="w-36 h-2 appearance-none bg-[#090c0f] border border-[#232c36] rounded-full cursor-pointer -rotate-90 origin-center accent-white"
              />
            </div>
            <div className="w-1.5 h-36 bg-[#090c0f] rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-[#1e2630]">
              <div 
                className="w-full bg-gradient-to-t from-[#38ef7d] via-[#00f5d4] to-[#e63946] rounded-full"
                style={{ height: `${Math.round(masterVolume * 70)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Normal Mode Tag */}
        <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-gray-500">
          NORMAL
        </span>
      </div>

      {/* ============================================================ */}
      {/* 2. HARDWARE DSP ROTARY UNIT (Center-Left)                    */}
      {/* ============================================================ */}
      <div className="w-60 min-w-[240px] p-3 border-r border-[#1e2630] flex flex-col justify-between bg-[#11151a]">
        {/* Top: 7-Segment LED Screen (08 MEMORY) + VALUE Rotary Knob */}
        <div className="flex items-center justify-between px-2">
          {/* Green Digital 7-Segment Screen */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-12 bg-[#080d0a] border border-[#1b2b20] rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-[#38ef7d] digital-lcd-green font-mono">
                {memoryPreset.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[8px] font-mono text-gray-500 uppercase mt-0.5 tracking-wider font-semibold">
              MEMORY
            </span>
          </div>

          {/* Large Rotary Knob (VALUE) */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => {
                setValueKnob(prev => (prev + 15) % 360);
                setMemoryPreset(prev => (prev % 9) + 1);
              }}
              title="Click or drag to adjust Value"
              className="w-12 h-12 rounded-full rotary-knob border border-[#323d4a] relative cursor-pointer flex items-center justify-center shadow-lg active:scale-95 transition"
            >
              {/* Knob indicator notch dot */}
              <div 
                className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] absolute shadow-[0_0_4px_#00f5d4]"
                style={{
                  top: '6px',
                  transform: `rotate(${valueKnob}deg)`,
                  transformOrigin: 'center 18px'
                }}
              />
            </div>
            <span className="text-[8px] font-mono text-gray-400 uppercase mt-0.5 font-semibold">
              VALUE
            </span>
          </div>
        </div>

        {/* Middle: 3 Smaller Rotary Knobs (GAIN, LEVEL, REVERB) */}
        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#1a2129]">
          {/* GAIN Knob */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setGainKnob(prev => (prev + 20) % 360)}
              className="w-7 h-7 rounded-full rotary-knob border border-[#2b3540] relative cursor-pointer"
            >
              <div 
                className="w-1 h-1 rounded-full bg-white absolute"
                style={{ top: '3px', transform: `rotate(${gainKnob}deg)`, transformOrigin: 'center 11px' }}
              />
            </div>
            <span className="text-[7.5px] font-mono text-gray-400 uppercase mt-0.5">GAIN</span>
          </div>

          {/* LEVEL Knob */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setLevelKnob(prev => (prev + 20) % 360)}
              className="w-7 h-7 rounded-full rotary-knob border border-[#2b3540] relative cursor-pointer"
            >
              <div 
                className="w-1 h-1 rounded-full bg-white absolute"
                style={{ top: '3px', transform: `rotate(${levelKnob}deg)`, transformOrigin: 'center 11px' }}
              />
            </div>
            <span className="text-[7.5px] font-mono text-gray-400 uppercase mt-0.5">LEVEL</span>
          </div>

          {/* REVERB Knob */}
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setReverbKnob(prev => (prev + 20) % 360)}
              className="w-7 h-7 rounded-full rotary-knob border border-[#2b3540] relative cursor-pointer"
            >
              <div 
                className="w-1 h-1 rounded-full bg-[#00f5d4] absolute shadow-[0_0_3px_#00f5d4]"
                style={{ top: '3px', transform: `rotate(${reverbKnob}deg)`, transformOrigin: 'center 11px' }}
              />
            </div>
            <span className="text-[7.5px] font-mono text-gray-400 uppercase mt-0.5">REVERB</span>
          </div>
        </div>

        {/* Bottom Hardware Push Switches (00/05 Select, MOD Out, DELAY Tuner/Exit) */}
        <div className="flex items-center justify-between text-[7.5px] font-mono text-gray-500 pt-1.5 border-t border-[#1a2129]">
          <button className="px-1.5 py-0.5 bg-[#171e26] hover:bg-[#212933] rounded border border-[#252f3a] text-gray-300">
            00/05 Select
          </button>
          <button className="px-1.5 py-0.5 bg-[#171e26] hover:bg-[#212933] rounded border border-[#252f3a] text-gray-300">
            MOD Out
          </button>
          <button className="px-1.5 py-0.5 bg-[#171e26] hover:bg-[#212933] rounded border border-[#252f3a] text-[#00f5d4]">
            DELAY Tuner
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SAMPLE BANK LIBRARY & AI GENERATOR (Center)               */}
      {/* ============================================================ */}
      <div className="flex-1 p-3 border-r border-[#1e2630] flex flex-col justify-between bg-[#11151a] min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2630]">
          <span className="text-[11px] font-semibold text-gray-200">
            Sample Bank Library
          </span>
          <div className="flex items-center gap-1.5 text-gray-400">
            <button 
              onClick={onOpenAIAssistant}
              title="Add with AI Studio (Suno/Udio)"
              className="p-1 hover:text-white hover:bg-[#1a2129] rounded"
            >
              <Plus className="w-3.5 h-3.5 text-[#00f5d4]" />
            </button>
            <button className="p-1 hover:text-white hover:bg-[#1a2129] rounded">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List of Sample Cards */}
        <div className="flex-1 overflow-y-auto py-1 flex flex-col gap-1.5">
          {samplePacks.map((pack) => (
            <div
              key={pack.id}
              onClick={() => {
                if (pack.isAi) {
                  onOpenAIAssistant();
                } else {
                  onAddSampleToTrack(pack.title, pack.genre, pack.color);
                }
              }}
              className="px-2.5 py-1.5 bg-[#161c22] hover:bg-[#1c242c] border border-[#202832] rounded-lg flex items-center justify-between cursor-pointer transition group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded-md overflow-hidden bg-[#242d38] border border-[#2d3845] shrink-0">
                  <img src={pack.image} alt={pack.title} className="w-full h-full object-cover" />
                </div>
                <div className="leading-tight truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white">
                      {pack.title}
                    </span>
                    {pack.isAi && (
                      <span className="px-1 py-0.2 bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/40 text-[8px] font-bold rounded">
                        AI
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {pack.genre}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-300">
                <Plus className="w-3.5 h-3.5 group-hover:text-[#00f5d4] transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. 10-BAND GRAPHIC EQUALIZER & LIVE OSCILLOSCOPE (Right)    */}
      {/* ============================================================ */}
      <div className="w-80 min-w-[320px] p-3 flex flex-col justify-between bg-[#11151a]">
        {/* Top: 10-Band EQ Vertical Sliders */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1e2630]">
          <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500">
            <span>+6</span>
            <span>0</span>
            <span>-6</span>
            <span>-12</span>
          </div>

          {/* 10 Fader Columns */}
          <div className="flex items-center gap-1 flex-1 px-2 justify-between">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const freqLabel = freq >= 1000 ? `${(freq / 1000).toFixed(1)}k` : `${freq}`;
              return (
                <div key={freq} className="flex flex-col items-center">
                  <div className="h-20 flex items-center relative">
                    <input 
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={eqGains[idx]}
                      onChange={(e) => handleEqChange(idx, Number(e.target.value))}
                      className="w-20 h-1.5 appearance-none bg-[#090c0f] border border-[#232c36] rounded-full cursor-pointer -rotate-90 origin-center accent-white"
                    />
                  </div>
                  <span className="text-[7.5px] font-mono text-gray-500 mt-1">
                    {freqLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: Real-Time Oscilloscope Canvas + Channel Selector */}
        <div className="flex items-center gap-2 pt-1.5">
          {/* Live Audio Oscilloscope Canvas */}
          <div className="flex-1 h-16 bg-[#080b0e] border border-[#1f2832] rounded-lg overflow-hidden shadow-inner relative">
            <canvas 
              ref={canvasRef} 
              width={200} 
              height={64} 
              className="w-full h-full block"
            />
          </div>

          {/* Channel Selectors (A / B & Memory slots) */}
          <div className="flex flex-col gap-1 text-[8px] font-mono text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-[7.5px]">CHANNEL</span>
              <button 
                onClick={() => setActiveChannel('A')}
                className={`px-1 py-0.5 rounded text-[7.5px] font-bold ${activeChannel === 'A' ? 'bg-[#38ef7d] text-black' : 'bg-[#182028] text-gray-400'}`}
              >
                A
              </button>
              <button 
                onClick={() => setActiveChannel('B')}
                className={`px-1 py-0.5 rounded text-[7.5px] font-bold ${activeChannel === 'B' ? 'bg-[#38ef7d] text-black' : 'bg-[#182028] text-gray-400'}`}
              >
                B
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <span className="text-[7px]">MEM</span>
              {[1, 2, 3, 4].map(slot => (
                <button
                  key={slot}
                  onClick={() => setActiveMemorySlot(slot)}
                  className={`w-3.5 h-3.5 rounded text-[7px] font-bold flex items-center justify-center ${activeMemorySlot === slot ? 'bg-[#00f5d4] text-black' : 'bg-[#182028] text-gray-400'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
