import React, { useState } from 'react';
import { Song } from '../types';
import { X, Mic, Music, Download, Play, Pause, Layers, CheckCircle2 } from 'lucide-react';

interface SunoStemsModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SunoStemsModal: React.FC<SunoStemsModalProps> = ({
  song,
  isOpen,
  onClose
}) => {
  const [playingStem, setPlayingStem] = useState<'vocal' | 'instrumental' | null>(null);
  const [audio] = useState(() => new Audio());

  if (!isOpen || !song) return null;

  const handleToggleStem = (type: 'vocal' | 'instrumental', url: string) => {
    if (playingStem === type) {
      audio.pause();
      setPlayingStem(null);
    } else {
      audio.src = url;
      audio.play().catch(e => console.warn(e));
      setPlayingStem(type);
      audio.onended = () => setPlayingStem(null);
    }
  };

  const vocalUrl = song.vocalStemUrl || song.audioUrl;
  const instrumentalUrl = song.instrumentalStemUrl || song.audioUrl;

  const handleClose = () => {
    audio.pause();
    setPlayingStem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#10141b] border border-[#232b36] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2530] flex items-center justify-between bg-[#141922]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/30 flex items-center justify-center text-[#00f5d4]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">AI Stem Separation</h3>
              <p className="text-xs text-gray-400 truncate max-w-xs">{song.title}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2633] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 bg-[#0d1016]">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-2xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Multitrack separation complete. You can preview and export isolated vocal and backing tracks.</span>
          </div>

          {/* Vocal Stem Card */}
          <div className="p-4 bg-[#141922] border border-[#232b37] rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff3366]/20 text-[#ff3366] flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Vocal Stem (Acapella)</h4>
                <p className="text-xs text-gray-400">Isolated lead vocals & harmonies</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStem('vocal', vocalUrl)}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow"
              >
                {playingStem === 'vocal' ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <a
                href={vocalUrl}
                download={`${song.title}-Vocals.mp3`}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-[#202734] rounded-xl transition"
                title="Download Vocals"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Instrumental Stem Card */}
          <div className="p-4 bg-[#141922] border border-[#232b37] rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f5d4]/20 text-[#00f5d4] flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instrumental Stem (Backing Track)</h4>
                <p className="text-xs text-gray-400">Drums, synths, bass, and FX</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStem('instrumental', instrumentalUrl)}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow"
              >
                {playingStem === 'instrumental' ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <a
                href={instrumentalUrl}
                download={`${song.title}-Instrumental.mp3`}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-[#202734] rounded-xl transition"
                title="Download Instrumental"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141922] border-t border-[#1e2530] flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-[#ff3366] hover:bg-[#ff4d79] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#ff3366]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
