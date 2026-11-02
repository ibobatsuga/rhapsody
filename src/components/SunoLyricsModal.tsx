import React, { useState } from 'react';
import { Song } from '../types';
import { X, Copy, Check, Music } from 'lucide-react';

interface SunoLyricsModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SunoLyricsModal: React.FC<SunoLyricsModalProps> = ({
  song,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !song) return null;

  const handleCopy = () => {
    if (song.lyrics) {
      navigator.clipboard.writeText(song.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#10141b] border border-[#232b36] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2530] flex items-center justify-between bg-[#141922]">
          <div className="flex items-center gap-3">
            <img 
              src={song.imageUrl} 
              alt={song.title} 
              className="w-12 h-12 rounded-xl object-cover border border-[#232b36] shadow-sm"
            />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{song.title}</h3>
              <p className="text-xs text-gray-400 capitalize flex items-center gap-1.5">
                <span>{song.provider.toUpperCase()} {song.model}</span>
                <span>•</span>
                <span>{song.tags}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1f2633] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lyrics Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-sm leading-relaxed text-gray-200">
          {song.lyrics ? (
            <div className="space-y-4 whitespace-pre-line font-medium text-gray-300 select-text">
              {song.lyrics.split('\n\n').map((block, idx) => {
                const isSectionHeader = block.startsWith('[') && block.includes(']');
                return (
                  <div key={idx} className="p-3 bg-[#151b24]/60 rounded-xl border border-[#1e2733]/50">
                    <p className="text-sm text-gray-200 leading-relaxed font-sans">{block}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-gray-500">
              <div className="w-12 h-12 rounded-2xl bg-[#1c232e] flex items-center justify-center text-gray-400">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-300">Instrumental Composition</p>
                <p className="text-xs text-gray-500 mt-1">This track does not contain lyrical vocal tracks.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141922] border-t border-[#1e2530] flex items-center justify-between text-xs">
          {song.lyrics ? (
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#1f2734] hover:bg-[#283242] text-gray-200 hover:text-white rounded-xl font-semibold transition flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Lyrics'}</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#ff3366] hover:bg-[#ff4d79] text-white rounded-xl font-bold transition shadow-md shadow-[#ff3366]/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
