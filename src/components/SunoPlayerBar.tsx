import React, { useRef, useEffect, useState } from 'react';
import { Song } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Heart, 
  Download, 
  Scissors,
  FileText
} from 'lucide-react';

interface SunoPlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleLike: (songId: string) => void;
  onToggleLyrics: () => void;
  showLyrics: boolean;
}

export const SunoPlayerBar: React.FC<SunoPlayerBarProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleLike,
  onToggleLyrics,
  showLyrics
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn('Audio play prevented:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins}:${remSecs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d1015] border-t border-[#1a1f26] px-5 flex items-center justify-between select-none z-40 shadow-2xl">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (isLoop) {
            audioRef.current?.play();
          } else {
            onNext();
          }
        }}
      />

      {/* Left: Song Info */}
      <div className="flex items-center gap-3.5 w-72 min-w-[220px]">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1f2632] shrink-0 border border-[#2d3846] shadow-md">
          <img 
            src={currentSong.imageUrl} 
            alt={currentSong.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white truncate">
              {currentSong.title}
            </span>
            <button
              onClick={() => onToggleLike(currentSong.id)}
              className={`p-1 transition ${currentSong.isLiked ? 'text-[#ff3366]' : 'text-gray-500 hover:text-white'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${currentSong.isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
          <span className="text-xs text-gray-400 truncate">
            {currentSong.provider.toUpperCase()} {currentSong.model} • {currentSong.tags.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLoop(!isLoop)}
            className={`p-1.5 rounded-lg transition ${isLoop ? 'text-[#ff3366]' : 'text-gray-500 hover:text-white'}`}
            title="Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevious}
            className="text-gray-400 hover:text-white transition p-1"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-gray-400 hover:text-white transition p-1"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onToggleLyrics}
            className={`p-1.5 rounded-lg transition ${showLyrics ? 'text-[#00f5d4]' : 'text-gray-500 hover:text-white'}`}
            title="View Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={progress}
            onChange={handleSeek}
            className="flex-1 accent-[#ff3366] h-1.5 bg-[#1f2632] rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-gray-500 w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Download */}
      <div className="flex items-center gap-3 w-72 justify-end">
        <a
          href={currentSong.audioUrl}
          download={`${currentSong.title}.mp3`}
          target="_blank"
          rel="noreferrer"
          className="p-2 text-gray-400 hover:text-white transition"
          title="Download MP3"
        >
          <Download className="w-4 h-4" />
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 accent-white h-1.5 bg-[#1f2632] rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
