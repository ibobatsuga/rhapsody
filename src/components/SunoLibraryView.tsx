import React, { useState } from 'react';
import { Song } from '../types';
import { SunoTrackCard } from './SunoTrackCard';
import { 
  Library, 
  Heart, 
  Scissors, 
  Search, 
  Music, 
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface SunoLibraryViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  onSplitStems: (song: Song) => void;
  onExtend: (song: Song) => void;
  onDelete: (songId: string) => void;
  onGoToCreate: () => void;
}

export const SunoLibraryView: React.FC<SunoLibraryViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onSplitStems,
  onExtend,
  onDelete,
  onGoToCreate
}) => {
  const [filterType, setFilterType] = useState<'all' | 'liked' | 'stems'>('all');
  const [search, setSearch] = useState('');

  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.tags.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'liked') return !!song.isLiked;
    if (filterType === 'stems') return !!song.vocalStemUrl || !!song.instrumentalStemUrl;
    return true;
  });

  const totalDurationSecs = songs.reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalMins = Math.floor(totalDurationSecs / 60);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 flex flex-col gap-6 max-w-7xl mx-auto w-full select-none">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1c232f]">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Library className="w-6 h-6 text-[#9d4edd]" />
            Your Music Library
          </h1>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
            <span>{songs.length} total tracks</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {totalMins} minutes created
            </span>
          </p>
        </div>

        <button
          onClick={onGoToCreate}
          className="px-4 py-2 bg-gradient-to-r from-[#ff3366] to-[#ff5e3a] hover:brightness-110 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-[#ff3366]/20 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Track</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#12161e] p-1 rounded-xl border border-[#1e2531]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-[#222a36] text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Tracks ({songs.length})
          </button>

          <button
            onClick={() => setFilterType('liked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'liked'
                ? 'bg-[#222a36] text-[#ff3366] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Liked ({songs.filter(s => s.isLiked).length})</span>
          </button>

          <button
            onClick={() => setFilterType('stems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'stems'
                ? 'bg-[#222a36] text-[#00f5d4] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Stems Separated ({songs.filter(s => s.vocalStemUrl).length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full bg-[#12161e] border border-[#1e2531] focus:border-[#9d4edd] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Song List */}
      {filteredSongs.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filteredSongs.map(song => (
            <SunoTrackCard
              key={song.id}
              song={song}
              isPlaying={currentSong?.id === song.id && isPlaying}
              onPlay={onPlaySong}
              onToggleLike={onToggleLike}
              onSplitStems={onSplitStems}
              onExtend={onExtend}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3 text-gray-500 border border-dashed border-[#1e2531] rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#151a23] flex items-center justify-center text-gray-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300">No tracks found</p>
            <p className="text-xs text-gray-500 mt-1">
              {filterType === 'liked' 
                ? 'You have not marked any tracks as favorite yet.' 
                : filterType === 'stems'
                ? 'No tracks with stem separation found.'
                : 'Start generating custom songs with Suno & Udio.'}
            </p>
          </div>
          <button
            onClick={onGoToCreate}
            className="mt-2 px-4 py-2 bg-[#1e2531] hover:bg-[#283241] text-white rounded-xl text-xs font-semibold transition"
          >
            Create a Track Now
          </button>
        </div>
      )}
    </div>
  );
};
