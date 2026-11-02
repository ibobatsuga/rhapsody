import React, { useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { X, CircleDot } from 'lucide-react';

interface DrumPadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PADS = [
  { id: 'kick', label: 'Punch Kick', key: '1', color: '#e63946' },
  { id: 'snare', label: 'Acoustic Snare', key: '2', color: '#ff9e00' },
  { id: 'clap', label: 'Studio Clap', key: '3', color: '#ffd166' },
  { id: 'hihat', label: 'Closed Hat', key: '4', color: '#00f5d4' },
  { id: '808_bass', label: '808 Sub Kick', key: 'Q', color: '#7b2cbf' },
  { id: 'hihat', label: 'Open Hi-Hat', key: 'W', color: '#06d6a0' },
  { id: 'snare', label: 'Rimshot', key: 'E', color: '#f77f00' },
  { id: 'kick', label: 'Sub Boom', key: 'R', color: '#d90429' },
  { id: 'clap', label: 'Snap Clap', key: 'A', color: '#f4a261' },
  { id: 'snare', label: 'Trap Snare', key: 'S', color: '#e76f51' },
  { id: '808_bass', label: 'Low 808', key: 'D', color: '#9d4edd' },
  { id: 'hihat', label: 'Pedal Hat', key: 'F', color: '#2a9d8f' },
  { id: 'snare', label: 'Ghost Snare', key: 'Z', color: '#e9c46a' },
  { id: 'kick', label: 'Hard Kick', key: 'X', color: '#e63946' },
  { id: 'clap', label: 'Room Clap', key: 'C', color: '#ffb703' },
  { id: '808_bass', label: 'Deep 808', key: 'V', color: '#5a189a' },
];

export const DrumPadsModal: React.FC<DrumPadsModalProps> = ({ isOpen, onClose }) => {
  const [activePad, setActivePad] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerPad = (id: string, soundType: string) => {
    setActivePad(id);
    audioEngine.playDrumSound(soundType);
    setTimeout(() => setActivePad(null), 120);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff9e00]/20 flex items-center justify-center text-[#ff9e00]">
              <CircleDot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rhapsody Drum Machine</h3>
              <p className="text-[11px] text-gray-400">16-Pad Real-Time WebAudio Synthesizer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4x4 Grid of Pads */}
        <div className="p-5 grid grid-cols-4 gap-3 bg-[#0e1117]">
          {PADS.map((pad, idx) => {
            const isPressed = activePad === `${pad.id}_${idx}`;
            return (
              <button
                key={idx}
                onMouseDown={() => triggerPad(`${pad.id}_${idx}`, pad.id)}
                className={`h-24 rounded-xl border flex flex-col items-center justify-between p-2.5 transition active:scale-95 shadow-md ${
                  isPressed 
                    ? 'brightness-150 scale-95 shadow-lg' 
                    : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: isPressed ? pad.color : `${pad.color}20`,
                  borderColor: pad.color,
                  boxShadow: isPressed ? `0 0 15px ${pad.color}` : 'none'
                }}
              >
                <span className="text-[10px] font-mono font-bold text-gray-400 self-end">
                  {pad.key}
                </span>
                <span className="text-xs font-bold text-white text-center leading-tight">
                  {pad.label}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">
                  {pad.id.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-[11px] text-gray-400">
          <span>Click any pad to play</span>
          <span className="font-mono text-[#00f5d4]">Sample Rate: 44.1kHz Zero-Latency</span>
        </div>
      </div>
    </div>
  );
};
