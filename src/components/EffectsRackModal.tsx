import React from 'react';
import { Track } from '../types';
import { X, Sliders, Activity } from 'lucide-react';

interface EffectsRackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onUpdateTrackEffects: (trackId: string, effects: any) => void;
}

export const EffectsRackModal: React.FC<EffectsRackModalProps> = ({
  isOpen,
  onClose,
  tracks,
  selectedTrackId,
  onSelectTrack,
  onUpdateTrackEffects
}) => {
  if (!isOpen) return null;

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#9d4edd]/20 flex items-center justify-center text-[#9d4edd]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Track DSP Effects Rack</h3>
              <p className="text-[11px] text-gray-400">Parametric Filter, Resonance, Delay & Reverb</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Selector Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-[#0e1117] border-b border-[#30363d] overflow-x-auto">
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTrack(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                currentTrack?.id === t.id
                  ? 'bg-[#9d4edd] text-white shadow'
                  : 'bg-[#21262d] text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Effect Parameters */}
        {currentTrack ? (
          <div className="p-5 flex flex-col gap-5 bg-[#0e1117]">
            {/* Filter Unit */}
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#00f5d4]" />
                  Biquad Frequency Filter
                </span>
                <div className="flex items-center bg-[#0e1117] p-1 rounded-md border border-[#30363d]">
                  {(['lowpass', 'highpass', 'bandpass'] as BiquadFilterType[]).map((fType) => (
                    <button
                      key={fType}
                      onClick={() => onUpdateTrackEffects(currentTrack.id, {
                        ...currentTrack.effects,
                        filterType: fType
                      })}
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded transition ${
                        currentTrack.effects.filterType === fType
                          ? 'bg-[#00f5d4] text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {fType}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Cutoff Frequency</span>
                  <span className="font-mono text-white">
                    {Math.round(currentTrack.effects.filterCutoff)} Hz
                  </span>
                </div>
                <input 
                  type="range"
                  min="40"
                  max="20000"
                  step="50"
                  value={currentTrack.effects.filterCutoff}
                  onChange={(e) => onUpdateTrackEffects(currentTrack.id, {
                    ...currentTrack.effects,
                    filterCutoff: Number(e.target.value)
                  })}
                  className="w-full accent-[#00f5d4] h-1.5 bg-[#0e1117] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Delay & Spatial Unit */}
            <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col gap-3">
              <span className="text-xs font-bold text-white">Stereo Pan & Gain Dynamics</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Stereo Pan</span>
                    <span className="font-mono text-white">
                      {Math.round(currentTrack.pan * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={currentTrack.pan}
                    onChange={(e) => onUpdateTrackEffects(currentTrack.id, {
                      ...currentTrack.effects
                    })}
                    className="w-full accent-[#e63946] h-1.5 bg-[#0e1117] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Track Gain</span>
                    <span className="font-mono text-white">
                      {Math.round(currentTrack.volume * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={currentTrack.volume}
                    onChange={(e) => onUpdateTrackEffects(currentTrack.id, {
                      ...currentTrack.effects
                    })}
                    className="w-full accent-[#ff9e00] h-1.5 bg-[#0e1117] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            No track selected.
          </div>
        )}

        <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
          <span>Changes are applied in real-time to the audio graph</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
