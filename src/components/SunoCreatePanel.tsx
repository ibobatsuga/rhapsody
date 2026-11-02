import React, { useState } from 'react';
import { AIProvider } from '../types';
import { AIService } from '../services/aiService';
import { 
  Sparkles, 
  Wand2, 
  Sliders, 
  Music, 
  Mic, 
  MicOff, 
  Loader2,
  ChevronDown
} from 'lucide-react';

interface SunoCreatePanelProps {
  onGenerate: (params: {
    provider: AIProvider;
    model: string;
    prompt: string;
    tags: string;
    title: string;
    lyrics?: string;
    isInstrumental: boolean;
  }) => Promise<void>;
  isGenerating: boolean;
  credits: number;
  initialPrompt?: string;
  initialTags?: string;
  initialTitle?: string;
}

const GENRE_TAGS = [
  'synthwave', 'lo-fi', 'indie pop', 'cyberpunk', 
  'acoustic guitar', 'edm anthem', 'heavy metal', 
  'r&b soul', 'cinematic orchestral', 'reggae'
];

export const SunoCreatePanel: React.FC<SunoCreatePanelProps> = ({
  onGenerate,
  isGenerating,
  credits,
  initialPrompt,
  initialTags,
  initialTitle
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('suno');
  const [model, setModel] = useState('v4');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Form Fields
  const [description, setDescription] = useState(initialPrompt || 'An energetic 80s synthwave anthem about speeding through neon city highways at night');
  const [lyrics, setLyrics] = useState('');
  const [styleTags, setStyleTags] = useState(initialTags || 'synthwave, retro, 80s, electronic, energetic');
  const [title, setTitle] = useState(initialTitle || 'Neon Horizon');

  useEffect(() => {
    if (initialPrompt) {
      setDescription(initialPrompt);
    }
    if (initialTags) {
      setStyleTags(initialTags);
    }
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialPrompt, initialTags, initialTitle]);

  const handleCreate = async () => {
    if (isGenerating) return;
    const activePrompt = isCustomMode ? (lyrics || styleTags) : description;
    if (!activePrompt.trim()) return;

    await onGenerate({
      provider,
      model,
      prompt: activePrompt,
      tags: isCustomMode ? styleTags : description,
      title: isCustomMode ? (title || 'AI Track') : 'AI Track',
      lyrics: isCustomMode && !isInstrumental ? lyrics : undefined,
      isInstrumental
    });
  };

  const handleMakeRandomLyrics = () => {
    const randomLyrics = AIService.generateRandomLyrics(description, styleTags);
    setLyrics(randomLyrics);
    if (!isCustomMode) setIsCustomMode(true);
  };

  const handleAddTag = (tag: string) => {
    if (isCustomMode) {
      if (!styleTags.includes(tag)) {
        setStyleTags(prev => prev ? `${prev}, ${tag}` : tag);
      }
    } else {
      setDescription(prev => `${prev}, ${tag}`);
    }
  };

  return (
    <div className="w-[380px] min-w-[380px] h-full bg-[#0d1015] border-r border-[#1a1f26] p-4 flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col gap-4">
        {/* Header & Custom Mode Switch */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1a1f26]">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Create</span>
            <span className="text-[10px] bg-gradient-to-r from-[#ff3366] to-[#ff9900] text-white px-1.5 py-0.2 rounded font-mono font-bold">
              v4
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Custom</span>
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                isCustomMode ? 'bg-[#ff3366] justify-end' : 'bg-[#232a34] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Model & Engine Selector (Suno v4, Suno v3.5, Udio v1.5) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            AI Model Engine
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#141820] p-1 rounded-xl border border-[#232a34]">
            <button
              onClick={() => { setProvider('suno'); setModel('v4'); }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                provider === 'suno' && model === 'v4'
                  ? 'bg-gradient-to-r from-[#ff3366] to-[#ff5e3a] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Suno v4
            </button>
            <button
              onClick={() => { setProvider('suno'); setModel('v3.5'); }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                provider === 'suno' && model === 'v3.5'
                  ? 'bg-gradient-to-r from-[#ff3366] to-[#ff5e3a] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Suno v3.5
            </button>
            <button
              onClick={() => { setProvider('udio'); setModel('v1.5'); }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                provider === 'udio'
                  ? 'bg-gradient-to-r from-[#9d4edd] to-[#c77dff] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Udio 1.5
            </button>
          </div>
        </div>

        {/* Form Fields: Custom Mode vs Simple Mode */}
        {!isCustomMode ? (
          /* Simple Mode (Song Description) */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300">
                Song Description
              </label>
              <button 
                onClick={handleMakeRandomLyrics}
                className="text-[11px] text-[#ff3366] hover:underline flex items-center gap-1 font-semibold"
              >
                <Wand2 className="w-3 h-3" />
                Generate Lyrics
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A high-energy electro-pop dance track with catchy synth riffs and infectious rhythm..."
              rows={4}
              className="w-full bg-[#141820] border border-[#232a34] focus:border-[#ff3366] rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none resize-none leading-relaxed transition"
            />
          </div>
        ) : (
          /* Custom Mode (Lyrics, Style, Title) */
          <div className="flex flex-col gap-3">
            {/* Lyrics Area */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">Lyrics</label>
                <button 
                  onClick={handleMakeRandomLyrics}
                  className="text-[11px] text-[#ff3366] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Wand2 className="w-3 h-3" />
                  Make Random Lyrics
                </button>
              </div>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Write your own lyrics or generate with AI...&#10;&#10;[Chorus]&#10;..."
                rows={5}
                className="w-full bg-[#141820] border border-[#232a34] focus:border-[#ff3366] rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none resize-none font-mono leading-relaxed transition"
              />
            </div>

            {/* Style of Music */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-300">Style of Music</label>
              <input
                type="text"
                value={styleTags}
                onChange={(e) => setStyleTags(e.target.value)}
                placeholder="e.g. synthwave, female vocals, 120 bpm"
                className="w-full bg-[#141820] border border-[#232a34] focus:border-[#ff3366] rounded-xl p-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Horizon"
                className="w-full bg-[#141820] border border-[#232a34] focus:border-[#ff3366] rounded-xl p-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Instrumental Switch */}
        <div className="flex items-center justify-between p-3 bg-[#141820] border border-[#232a34] rounded-xl">
          <div className="flex items-center gap-2">
            {isInstrumental ? (
              <MicOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Mic className="w-4 h-4 text-[#ff3366]" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Instrumental</span>
              <span className="text-[10px] text-gray-400">Without vocal singing</span>
            </div>
          </div>
          <button
            onClick={() => setIsInstrumental(!isInstrumental)}
            className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
              isInstrumental ? 'bg-amber-400 justify-end' : 'bg-[#232a34] justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Genre Preset Suggestion Chips */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Popular Styles
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GENRE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="text-[10px] font-medium bg-[#141820] hover:bg-[#1f2530] text-gray-300 hover:text-white px-2 py-1 rounded-lg border border-[#232a34] transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Submit Button */}
      <div className="pt-4 border-t border-[#1a1f26] flex flex-col gap-2">
        <button
          onClick={handleCreate}
          disabled={isGenerating}
          className="w-full py-3.5 bg-gradient-to-r from-[#ff3366] via-[#ff5e3a] to-[#ff9900] hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#ff3366]/25 transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating ({provider.toUpperCase()})...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Create Song (5 Credits)</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-gray-500">
          Uses GoAPI Gateway. Stems and multitrack separation available.
        </p>
      </div>
    </div>
  );
};
