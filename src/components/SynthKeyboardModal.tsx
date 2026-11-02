import React, { useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { X, Music } from 'lucide-react';

interface SynthKeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Frequency mapping for 2 octaves (C3 to B4)
const KEYS = [
  { note: 'C3', freq: 130.81, isBlack: false },
  { note: 'C#3', freq: 138.59, isBlack: true },
  { note: 'D3', freq: 146.83, isBlack: false },
  { note: 'D#3', freq: 155.56, isBlack: true },
  { note: 'E3', freq: 164.81, isBlack: false },
  { note: 'F3', freq: 174.61, isBlack: false },
  { note: 'F#3', freq: 185.00, isBlack: true },
  { note: 'G3', freq: 196.00, isBlack: false },
  { note: 'G#3', freq: 207.65, isBlack: true },
  { note: 'A3', freq: 220.00, isBlack: false },
  { note: 'A#3', freq: 233.08, isBlack: true },
  { note: 'B3', freq: 246.94, isBlack: false },

  { note: 'C4', freq: 261.63, isBlack: false },
  { note: 'C#4', freq: 277.18, isBlack: true },
  { note: 'D4', freq: 293.66, isBlack: false },
  { note: 'D#4', freq: 311.13, isBlack: true },
  { note: 'E4', freq: 329.63, isBlack: false },
  { note: 'F4', freq: 349.23, isBlack: false },
  { note: 'F#4', freq: 369.99, isBlack: true },
  { note: 'G4', freq: 392.00, isBlack: false },
  { note: 'G#4', freq: 415.30, isBlack: true },
  { note: 'A4', freq: 440.00, isBlack: false },
  { note: 'A#4', freq: 466.16, isBlack: true },
  { note: 'B4', freq: 493.88, isBlack: false },
  { note: 'C5', freq: 523.25, isBlack: false }
];

export const SynthKeyboardModal: React.FC<SynthKeyboardModalProps> = ({ isOpen, onClose }) => {
  const [waveType, setWaveType] = useState<OscillatorType>('sawtooth');
  const [octaveMultiplier, setOctaveMultiplier] = useState(1.0);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const playNote = (note: string, freq: number) => {
    setActiveNote(note);
    audioEngine.playSynthNote(freq * octaveMultiplier, waveType, 0.6);
    setTimeout(() => setActiveNote(null), 150);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00f5d4]/20 flex items-center justify-center text-[#00f5d4]">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rhapsody Poly-Synthesizer</h3>
              <p className="text-[11px] text-gray-400">Playable Keyboard with Resonant Filter</p>
            </div>
          </div>

          {/* Synth Wave Settings */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0e1117] p-1 rounded-lg border border-[#30363d]">
              {(['sawtooth', 'square', 'triangle', 'sine'] as OscillatorType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setWaveType(w)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded transition ${
                    waveType === w 
                      ? 'bg-[#00f5d4] text-black shadow' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard Piano Keys */}
        <div className="p-6 bg-[#0e1117] flex justify-center overflow-x-auto">
          <div className="relative flex h-48 select-none">
            {KEYS.filter(k => !k.isBlack).map((whiteKey) => {
              const isPressed = activeNote === whiteKey.note;
              return (
                <button
                  key={whiteKey.note}
                  onMouseDown={() => playNote(whiteKey.note, whiteKey.freq)}
                  className={`w-11 h-full bg-white border border-gray-400 rounded-b-lg flex flex-col justify-end items-center pb-2 transition active:bg-gray-200 ${
                    isPressed ? 'bg-cyan-200' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-gray-700">
                    {whiteKey.note}
                  </span>
                </button>
              );
            })}

            {/* Black keys overlaid on top */}
            <div className="absolute inset-0 pointer-events-none flex">
              {KEYS.map((key, i) => {
                if (!key.isBlack) return null;
                // Calculate position relative to previous white keys
                const whiteKeysBefore = KEYS.slice(0, i).filter(k => !k.isBlack).length;
                const leftOffset = (whiteKeysBefore * 44) - 15;
                const isPressed = activeNote === key.note;

                return (
                  <button
                    key={key.note}
                    onMouseDown={() => playNote(key.note, key.freq)}
                    style={{ left: leftOffset }}
                    className={`absolute pointer-events-auto w-7 h-28 bg-[#1f2428] border border-black rounded-b-md flex flex-col justify-end items-center pb-1.5 shadow-md transition active:bg-[#00f5d4] ${
                      isPressed ? 'bg-[#00f5d4]' : 'hover:bg-[#2f363d]'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-gray-400">
                      {key.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
          <span>Click piano keys to play melody</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Octave:</span>
            <button 
              onClick={() => setOctaveMultiplier(prev => Math.max(0.5, prev * 0.5))}
              className="px-2 py-0.5 bg-[#21262d] rounded border border-[#30363d] hover:bg-[#30363d] font-mono"
            >
              -1
            </button>
            <span className="font-mono text-white text-xs">{octaveMultiplier}x</span>
            <button 
              onClick={() => setOctaveMultiplier(prev => Math.min(4.0, prev * 2.0))}
              className="px-2 py-0.5 bg-[#21262d] rounded border border-[#30363d] hover:bg-[#30363d] font-mono"
            >
              +1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
