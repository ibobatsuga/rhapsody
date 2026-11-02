import React, { useRef } from 'react';
import { Track, AudioClip } from '../types';
import { Plus } from 'lucide-react';

interface TimelineProps {
  tracks: Track[];
  currentTime: number;
  bpm: number;
  zoom: number; // pixels per second
  onSeek: (seconds: number) => void;
  onSelectTrack: (trackId: string) => void;
  selectedTrackId: string | null;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onAddTrack: (type: 'audio' | 'synth' | 'drums') => void;
}

// Generate organic SVG waveform curve path matching the reference UI
const renderOrganicWaveform = (width: number, height: number, color: string, seed: number) => {
  const points = Math.max(16, Math.floor(width / 6));
  const midY = height / 2;
  let topPath = `M 0 ${midY}`;
  let bottomPath = `L ${width} ${midY}`;

  const topCoords: [number, number][] = [];
  const bottomCoords: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const progress = i / points;
    // Organic harmonic wave shape
    const amplitude = 
      Math.sin(progress * Math.PI * 3 + seed) * 0.45 +
      Math.sin(progress * Math.PI * 7 + seed * 2) * 0.35 +
      Math.cos(progress * Math.PI * 11) * 0.2;

    const clampedAmp = Math.max(0.15, Math.min(0.9, Math.abs(amplitude)));
    const yTop = midY - (clampedAmp * (midY - 4));
    const yBottom = midY + (clampedAmp * (midY - 4));

    topCoords.push([x, yTop]);
    bottomCoords.unshift([x, yBottom]);
  }

  topCoords.forEach(([x, y]) => {
    topPath += ` L ${x} ${y}`;
  });

  let fullPath = topPath;
  bottomCoords.forEach(([x, y]) => {
    fullPath += ` L ${x} ${y}`;
  });
  fullPath += ' Z';

  return (
    <svg width={width} height={height} className="w-full h-full overflow-visible pointer-events-none">
      <path
        d={fullPath}
        fill={color}
        opacity={0.88}
        className="transition-all duration-300"
      />
    </svg>
  );
};

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  currentTime,
  zoom,
  onSeek,
  onSelectTrack,
  selectedTrackId,
  selectedClipId,
  onSelectClip,
  onAddTrack
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const totalDuration = 18; // 0s to 16s visible range matching the image
  const totalWidth = totalDuration * zoom;

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, clickX / zoom);
    onSeek(seekTime);
  };

  // 1-second interval markers: 00s, 01s, 02s, ... 16s
  const markers = [];
  for (let s = 0; s <= 16; s++) {
    markers.push({
      time: s,
      left: s * zoom,
      label: `${s.toString().padStart(2, '0')}s`
    });
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0e1216] select-none overflow-hidden relative">
      {/* Top Timeline Ruler Bar */}
      <div className="h-7 bg-[#12171c] border-b border-[#1b232a] flex select-none z-10 sticky top-0">
        {/* Track Label Corner */}
        <div className="w-24 min-w-[96px] border-r border-[#1b232a] px-3 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <button 
            onClick={() => onAddTrack('audio')}
            title="Add Track"
            className="text-gray-400 hover:text-white flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-[#00f5d4]" />
            <span className="text-[10px]">Track</span>
          </button>
        </div>

        {/* Scrollable Seconds Ruler */}
        <div 
          ref={rulerRef}
          onClick={handleRulerClick}
          className="flex-1 h-full relative cursor-pointer overflow-x-hidden bg-[#12171c]"
          style={{ minWidth: totalWidth }}
        >
          {markers.map((m, idx) => (
            <div 
              key={idx}
              className="absolute top-0 bottom-0 border-l border-[#1b232a] pl-1 flex items-center text-[9px] font-mono text-gray-500"
              style={{ left: m.left }}
            >
              {m.label}
            </div>
          ))}

          {/* Cyan Playhead Triangle on Ruler */}
          <div 
            className="absolute top-0 bottom-0 w-2 -ml-[4px] z-20 pointer-events-none"
            style={{ left: currentTime * zoom }}
          >
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#00f5d4]" />
          </div>
        </div>
      </div>

      {/* Main Track Grid Workspace */}
      <div className="flex-1 overflow-y-auto overflow-x-auto relative flex">
        {/* Playhead vertical cyan laser line */}
        <div 
          className="absolute top-0 bottom-0 w-[1.5px] bg-[#00f5d4] z-30 pointer-events-none shadow-[0_0_8px_rgba(0,245,212,0.8)]"
          style={{ left: 96 + currentTime * zoom }}
        />

        {/* Left Track Headers (Column) */}
        <div className="w-24 min-w-[96px] flex flex-col sticky left-0 z-20 bg-[#12171c] border-r border-[#1b232a]">
          {tracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`h-14 border-b border-[#1b232a] px-3 flex items-center justify-between cursor-pointer transition ${
                  isSelected ? 'bg-[#182027]' : 'hover:bg-[#151b21]'
                }`}
              >
                <span className="text-xs font-semibold text-gray-300 truncate">
                  {track.name}
                </span>

                {/* Glowing LED status dot */}
                <div 
                  className="w-2 h-2 rounded-full transition shadow-sm"
                  style={{
                    backgroundColor: track.color,
                    boxShadow: track.muted ? 'none' : `0 0 6px ${track.color}`
                  }}
                />
              </div>
            );
          })}

          {/* Bottom Add Track Item */}
          <div 
            onClick={() => onAddTrack('audio')}
            className="h-14 border-b border-[#1b232a] px-3 flex items-center justify-between cursor-pointer text-gray-500 hover:text-gray-300 hover:bg-[#151b21] transition"
          >
            <span className="text-xs font-medium">Track</span>
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Timeline Grid & Waves (Right) */}
        <div 
          className="flex-1 flex flex-col relative bg-[#0b0e12]"
          style={{ minWidth: totalWidth }}
        >
          {/* Vertical Grid Lines (1-second intervals) */}
          <div className="absolute inset-0 pointer-events-none">
            {markers.map((m, idx) => (
              <div 
                key={idx}
                className="absolute top-0 bottom-0 border-l border-[#161c22]"
                style={{ left: m.left }}
              />
            ))}
          </div>

          {/* Track Lanes */}
          {tracks.map((track, trackIdx) => (
            <div 
              key={track.id}
              className="h-14 border-b border-[#161c22] relative flex items-center"
            >
              {/* Clips inside lane */}
              {track.clips.map((clip, clipIdx) => {
                const clipLeft = clip.startTime * zoom;
                const clipWidth = Math.max(48, clip.duration * zoom);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id);
                    }}
                    className={`absolute h-10 rounded-lg flex flex-col justify-between overflow-hidden shadow-sm cursor-pointer select-none transition ${
                      isSelected
                        ? 'ring-2 ring-[#00f5d4] shadow-[0_0_12px_rgba(0,245,212,0.4)] z-10'
                        : 'hover:brightness-110'
                    }`}
                    style={{
                      left: clipLeft,
                      width: clipWidth,
                      backgroundColor: `${clip.color}18`,
                      border: isSelected ? '1px solid #00f5d4' : `1px solid ${clip.color}35`,
                      top: '8px'
                    }}
                  >
                    {/* Clip Title Header */}
                    <div className="px-2 pt-0.5 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-bold text-gray-200 truncate drop-shadow">
                        {clip.name}
                      </span>
                    </div>

                    {/* Rendered Smooth SVG Waveform */}
                    <div className="flex-1 flex items-center justify-center px-1 overflow-hidden">
                      {renderOrganicWaveform(clipWidth - 8, 20, clip.color, (trackIdx + 1) * 3 + clipIdx)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Empty Row for bottom spacer */}
          <div className="h-14 border-b border-[#161c22]" />
        </div>
      </div>
    </div>
  );
};
