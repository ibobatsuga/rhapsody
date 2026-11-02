import React, { useRef } from 'react';
import { Track, AudioClip } from '../types';
import { TrackControl } from './TrackControl';
import { Plus, Sparkles, Music2, Wand2 } from 'lucide-react';

interface TimelineProps {
  tracks: Track[];
  currentTime: number;
  bpm: number;
  zoom: number; // pixels per second
  onSeek: (seconds: number) => void;
  onUpdateTrack: (trackId: string, updated: Partial<Track>) => void;
  onDeleteTrack: (trackId: string) => void;
  onAddTrack: (type: 'audio' | 'synth' | 'drums') => void;
  onDeleteClip: (trackId: string, clipId: string) => void;
  onOpenAIAssistant: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  currentTime,
  bpm,
  zoom,
  onSeek,
  onUpdateTrack,
  onDeleteTrack,
  onAddTrack,
  onDeleteClip,
  onOpenAIAssistant
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const totalDuration = 60; // 60 seconds view window default
  const totalWidth = totalDuration * zoom;

  // Handle click on ruler to seek
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, clickX / zoom);
    onSeek(seekTime);
  };

  // Generate ruler markers
  const markers = [];
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;

  for (let s = 0; s < totalDuration; s += barSec) {
    const barNumber = Math.floor(s / barSec) + 1;
    markers.push({
      time: s,
      left: s * zoom,
      label: `Bar ${barNumber} (${Math.floor(s)}s)`
    });
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0e1117] overflow-hidden relative">
      {/* Top Ruler */}
      <div className="h-9 bg-[#161b22] border-b border-[#30363d] flex select-none z-10 sticky top-0">
        {/* Track Control Header spacer */}
        <div className="w-56 min-w-[224px] border-r border-[#30363d] px-3 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Tracks ({tracks.length})</span>
          <span className="text-[10px] text-gray-500 font-mono">4/4 @ {bpm} BPM</span>
        </div>

        {/* Scrollable Ruler */}
        <div 
          ref={rulerRef}
          onClick={handleRulerClick}
          className="flex-1 h-full relative cursor-pointer overflow-x-hidden bg-[#161b22]/50 hover:bg-[#161b22]"
          style={{ minWidth: totalWidth }}
        >
          {markers.map((m, idx) => (
            <div 
              key={idx}
              className="absolute top-0 bottom-0 border-l border-[#30363d] pl-1.5 flex items-center text-[10px] font-mono text-gray-400"
              style={{ left: m.left }}
            >
              {m.label}
            </div>
          ))}

          {/* Playhead marker indicator on ruler */}
          <div 
            className="absolute top-0 bottom-0 w-2.5 -ml-[5px] z-20 flex flex-col items-center pointer-events-none"
            style={{ left: currentTime * zoom }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-[#00f5d4]" />
            <div className="w-[1.5px] flex-1 bg-[#00f5d4] shadow-sm shadow-[#00f5d4]" />
          </div>
        </div>
      </div>

      {/* Main Track Workspace */}
      <div className="flex-1 overflow-y-auto overflow-x-auto relative flex">
        {/* Playhead line cutting across all tracks */}
        <div 
          className="absolute top-0 bottom-0 w-[1.5px] bg-[#00f5d4] z-30 pointer-events-none shadow-sm shadow-[#00f5d4]"
          style={{ left: 224 + currentTime * zoom }}
        />

        {/* Track Controls (Left column) */}
        <div className="w-56 min-w-[224px] flex flex-col sticky left-0 z-20 bg-[#161b22]">
          {tracks.map((track) => (
            <TrackControl
              key={track.id}
              track={track}
              onUpdateTrack={(updated) => onUpdateTrack(track.id, updated)}
              onDeleteTrack={() => onDeleteTrack(track.id)}
            />
          ))}

          {/* Add Track Action Bar */}
          <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex flex-col gap-2">
            <span className="text-[11px] font-medium text-gray-400">Add Track:</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => onAddTrack('audio')}
                className="flex-1 px-2 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs rounded border border-[#30363d] transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#e63946]" />
                Audio
              </button>
              <button 
                onClick={() => onAddTrack('synth')}
                className="flex-1 px-2 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs rounded border border-[#30363d] transition flex items-center justify-center gap-1"
              >
                <Music2 className="w-3 h-3 text-[#00f5d4]" />
                Synth
              </button>
              <button 
                onClick={() => onAddTrack('drums')}
                className="flex-1 px-2 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs rounded border border-[#30363d] transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#ff9e00]" />
                Drums
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Grid (Right side) */}
        <div 
          className="flex-1 flex flex-col relative bg-[#0e1117]"
          style={{ minWidth: totalWidth }}
        >
          {/* Vertical Grid background lines */}
          <div className="absolute inset-0 pointer-events-none">
            {markers.map((m, idx) => (
              <div 
                key={idx}
                className="absolute top-0 bottom-0 border-l border-[#21262d]/40"
                style={{ left: m.left }}
              />
            ))}
          </div>

          {/* Track Lanes */}
          {tracks.map((track) => (
            <div 
              key={track.id}
              className="h-24 border-b border-[#21262d] relative group flex items-center"
            >
              {/* Clips inside this track */}
              {track.clips.map((clip) => {
                const clipLeft = clip.startTime * zoom;
                const clipWidth = Math.max(30, clip.duration * zoom);

                return (
                  <div
                    key={clip.id}
                    className="absolute h-18 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-md cursor-pointer border select-none transition hover:brightness-110"
                    style={{
                      left: clipLeft,
                      width: clipWidth,
                      backgroundColor: `${clip.color}25`,
                      borderColor: clip.color,
                      top: '6px',
                      bottom: '6px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {clip.isAiGenerated && (
                          <span className="px-1 py-0.2 bg-gradient-to-r from-[#e63946] to-[#9d4edd] text-white text-[9px] rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                        <span className="text-xs font-bold text-white truncate drop-shadow">
                          {clip.name}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClip(track.id, clip.id);
                        }}
                        className="text-gray-400 hover:text-white text-xs px-1 hover:bg-black/40 rounded transition"
                        title="Delete clip"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Decorative SVG Waveform */}
                    <div className="h-6 w-full flex items-center gap-[2px] opacity-80 overflow-hidden">
                      {Array.from({ length: Math.min(80, Math.floor(clipWidth / 4)) }).map((_, i) => {
                        const heightPercent = 20 + Math.sin(i * 0.4) * 35 + Math.cos(i * 0.8) * 35;
                        return (
                          <div 
                            key={i}
                            className="w-[2px] rounded-full"
                            style={{
                              height: `${Math.max(15, Math.min(95, heightPercent))}%`,
                              backgroundColor: clip.color
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="text-[10px] font-mono text-gray-300">
                      {clip.duration.toFixed(1)}s
                    </div>
                  </div>
                );
              })}

              {/* Empty state hint if track has no clips */}
              {track.clips.length === 0 && (
                <div className="pl-6 text-xs text-gray-600 font-mono italic">
                  Drag audio here or use AI Assistant to generate stems
                </div>
              )}
            </div>
          ))}

          {/* Empty timeline prompt to trigger AI Generator */}
          {tracks.length > 0 && tracks.every(t => t.clips.length === 0) && (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-3">
                <Wand2 className="w-6 h-6 text-[#e63946]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-300 mb-1">Your timeline is empty</h3>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Generate drum grooves, basslines, or full stems with Suno & Udio in the AI Assistant.
              </p>
              <button 
                onClick={onOpenAIAssistant}
                className="px-4 py-2 bg-gradient-to-r from-[#e63946] to-[#9d4edd] text-white text-xs font-semibold rounded-lg shadow-lg shadow-[#e63946]/20 transition hover:brightness-110 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Open AI Studio Assistant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
