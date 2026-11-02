import React, { useState, useEffect } from 'react';
import { AIProvider } from '../types';
import { AIService } from '../services/aiService';
import { 
  Sparkles, 
  Dices, 
  RotateCcw, 
  Trash2, 
  Undo2, 
  Redo2, 
  Edit3, 
  Maximize2, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Folder, 
  Music,
  Info,
  Loader2
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
    vocalGender?: 'male' | 'female' | 'any';
    weirdness?: number;
    styleInfluence?: number;
    variety?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  credits: number;
  initialPrompt?: string;
  initialTags?: string;
  initialTitle?: string;
}

const STYLE_CHIPS = [
  'operatic pop', 'russian hip hop', 'traditional instruments', 
  'armenian folk', 'alt-country', 'funkot', 'koplo', 'synthwave'
];

export const SunoCreatePanel: React.FC<SunoCreatePanelProps> = ({
  onGenerate,
  isGenerating,
  credits,
  initialPrompt,
  initialTags,
  initialTitle
}) => {
  // Tabs: Songs vs Speech
  const [activeTab, setActiveTab] = useState<'songs' | 'speech'>('songs');
  const [mode, setMode] = useState<'simple' | 'advanced'>('advanced');
  const [model, setModel] = useState<string>('v6-mini');

  // Accordion Expand/Collapse States
  const [expandLyrics, setExpandLyrics] = useState(true);
  const [expandStyles, setExpandStyles] = useState(true);
  const [expandMore, setExpandMore] = useState(true);

  // Form Fields
  const [simplePrompt, setSimplePrompt] = useState(initialPrompt || 'An energetic funkot dance track with driving synth and kendang koplo');
  const [lyrics, setLyrics] = useState('');
  const [styleDescription, setStyleDescription] = useState(initialTags || 'operatic pop, russian hip hop, traditional instruments, armenian folk, alt-country');
  const [vocalGender, setVocalGender] = useState<'male' | 'female' | 'any'>('female');
  const [durationMode, setDurationMode] = useState<'auto' | 'custom'>('auto');
  const [maxMode, setMaxMode] = useState(false);
  const [weirdness, setWeirdness] = useState(50);
  const [styleInfluence, setStyleInfluence] = useState(50);
  const [variety, setVariety] = useState('Extra');
  const [personalize, setPersonalize] = useState(false);
  const [title, setTitle] = useState(initialTitle || '');

  useEffect(() => {
    if (initialPrompt) setSimplePrompt(initialPrompt);
    if (initialTags) setStyleDescription(initialTags);
    if (initialTitle) setTitle(initialTitle);
  }, [initialPrompt, initialTags, initialTitle]);

  const handleMakeRandomLyrics = () => {
    const randomLyrics = AIService.generateRandomLyrics(simplePrompt, styleDescription);
    setLyrics(randomLyrics);
    setExpandLyrics(true);
  };

  const handleRandomizeStyle = () => {
    const styles = [
      'funkot, kendang koplo, metallic robotic synthesizer, 132 bpm',
      'piano pop, folk-pop, wedding instrumental, fingerpicked acoustic guitar',
      'dark cyberpunk synthwave, aggressive distorted bass, female vocal',
      'lo-fi mellow chillhop, vintage rhodes, vinyl crackle, warm bass'
    ];
    const picked = styles[Math.floor(Math.random() * styles.length)];
    setStyleDescription(picked);
  };

  const handleAddTag = (tag: string) => {
    if (!styleDescription.includes(tag)) {
      setStyleDescription(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  const handleReset = () => {
    setLyrics('');
    setStyleDescription('operatic pop, russian hip hop, traditional instruments');
    setTitle('');
    setWeirdness(50);
    setStyleInfluence(50);
  };

  const handleSubmit = async () => {
    if (isGenerating) return;

    const finalPrompt = mode === 'simple' 
      ? simplePrompt 
      : (lyrics ? `${lyrics}\n\n[Style]: ${styleDescription}` : styleDescription);

    await onGenerate({
      provider: 'suno',
      model,
      prompt: finalPrompt,
      tags: styleDescription,
      title: title || (lyrics ? 'Custom Composition' : 'Untitled AI Track'),
      lyrics: lyrics.trim() ? lyrics : undefined,
      isInstrumental: !lyrics.trim(),
      vocalGender,
      weirdness,
      styleInfluence,
      variety
    });
  };

  return (
    <div className="w-[360px] min-w-[360px] h-full bg-[#0b0e13] border-r border-[#191d26] flex flex-col justify-between overflow-y-auto select-none font-sans scrollbar-thin scrollbar-thumb-[#1e2531]">
      <div className="flex flex-col">
        {/* 1. Header: Songs vs Speech Tabs */}
        <div className="flex items-center border-b border-[#181c25] px-4 pt-3">
          <button
            onClick={() => setActiveTab('songs')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition relative ${
              activeTab === 'songs' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Songs</span>
            {activeTab === 'songs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('speech')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition relative ${
              activeTab === 'speech' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Speech</span>
            {activeTab === 'speech' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t" />
            )}
          </button>
        </div>

        {/* 2. Sub-Header: Mode Pills (Simple / Advanced) & Model Dropdown */}
        <div className="flex items-center justify-between p-3 border-b border-[#161a22]">
          <div className="flex items-center bg-[#13171f] p-0.5 rounded-xl border border-[#212733]">
            <button
              onClick={() => setMode('simple')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                mode === 'simple'
                  ? 'bg-[#232a36] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                mode === 'advanced'
                  ? 'bg-[#232a36] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Advanced
            </button>
          </div>

          {/* Model Selector Pill */}
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#13171f] hover:bg-[#1a202c] text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-[#212733] appearance-none pr-7 cursor-pointer focus:outline-none"
            >
              <option value="v6-mini">v6-mini</option>
              <option value="v6">v6</option>
              <option value="v4">v4</option>
              <option value="v3.5">v3.5</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Main Form Body */}
        <div className="p-3 flex flex-col gap-3">
          {mode === 'simple' ? (
            /* Simple Mode Form */
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-300">Song Description</label>
              <textarea
                value={simplePrompt}
                onChange={(e) => setSimplePrompt(e.target.value)}
                placeholder="e.g. A romantic pop ballad with gentle acoustic guitar and warm female vocals..."
                rows={6}
                className="w-full bg-[#121620] border border-[#202735] focus:border-[#ff3366] rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none leading-relaxed resize-none"
              />
            </div>
          ) : (
            /* Advanced Mode (Exact match to Screenshots 1, 2, 3) */
            <div className="flex flex-col gap-2.5">
              {/* Quick Actions Pills */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleMakeRandomLyrics}
                  className="flex-1 py-1.5 px-2 bg-[#141822] hover:bg-[#1d2331] text-xs font-semibold text-gray-300 rounded-xl border border-[#212836] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Audio</span>
                </button>
                <button 
                  onClick={() => setVocalGender(vocalGender === 'male' ? 'female' : 'male')}
                  className="flex-1 py-1.5 px-2 bg-[#141822] hover:bg-[#1d2331] text-xs font-semibold text-gray-300 rounded-xl border border-[#212836] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Voice</span>
                </button>
                <button 
                  onClick={handleRandomizeStyle}
                  className="flex-1 py-1.5 px-2 bg-[#141822] hover:bg-[#1d2331] text-xs font-semibold text-gray-300 rounded-xl border border-[#212836] flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Inspo</span>
                </button>
              </div>

              {/* Accordion 1: Lyrics */}
              <div className="border border-[#1f2533] rounded-2xl bg-[#11141c] overflow-hidden">
                <div 
                  onClick={() => setExpandLyrics(!expandLyrics)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#151924] transition"
                >
                  <div className="flex items-center gap-2">
                    {expandLyrics ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs font-bold text-gray-200">Lyrics</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleMakeRandomLyrics} title="Randomize Lyrics" className="hover:text-white p-1">
                      <Dices className="w-3.5 h-3.5" />
                    </button>
                    <button title="Undo" className="hover:text-white p-1">
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button title="Redo" className="hover:text-white p-1">
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {expandLyrics && (
                  <div className="p-3 pt-0 relative flex flex-col">
                    <textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Start writing lyrics, or leave this empty for Instrumental"
                      rows={5}
                      className="w-full bg-[#0d1017] border border-[#1b212d] focus:border-[#ff3366] rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 font-mono leading-relaxed resize-none focus:outline-none"
                    />
                    {/* Floating Sparkle AI button at bottom right */}
                    <button
                      onClick={handleMakeRandomLyrics}
                      title="AI Generate Lyrics"
                      className="absolute bottom-5 right-5 w-7 h-7 rounded-full bg-[#1e2533] hover:bg-[#283244] text-white flex items-center justify-center shadow-md transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 2: Styles */}
              <div className="border border-[#1f2533] rounded-2xl bg-[#11141c] overflow-hidden">
                <div 
                  onClick={() => setExpandStyles(!expandStyles)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#151924] transition"
                >
                  <div className="flex items-center gap-2">
                    {expandStyles ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs font-bold text-gray-200">Styles</span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRandomizeStyle(); }}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                </div>

                {expandStyles && (
                  <div className="p-3 pt-0 flex flex-col gap-2.5">
                    <textarea
                      value={styleDescription}
                      onChange={(e) => setStyleDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0d1017] border border-[#1b212d] focus:border-[#ff3366] rounded-xl p-2.5 text-xs text-gray-200 placeholder-gray-500 leading-relaxed resize-none focus:outline-none"
                    />

                    {/* Action buttons + chips (like Image 2) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={handleRandomizeStyle}
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow"
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleRandomizeStyle}
                        className="w-7 h-7 rounded-lg bg-[#1a202c] hover:bg-[#252e3e] text-gray-300 flex items-center justify-center shrink-0 border border-[#293345]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      {STYLE_CHIPS.map(chip => (
                        <button
                          key={chip}
                          onClick={() => handleAddTag(chip)}
                          className="px-2.5 py-1 rounded-lg bg-[#141822] hover:bg-[#1d2331] text-[10px] font-medium text-gray-300 hover:text-white border border-[#212836] whitespace-nowrap transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: More Options (Image 1 & 2) */}
              <div className="border border-[#1f2533] rounded-2xl bg-[#11141c] overflow-hidden">
                <div 
                  onClick={() => setExpandMore(!expandMore)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#151924] transition"
                >
                  <div className="flex items-center gap-2">
                    {expandMore ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs font-bold text-gray-200">More Options</span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    title="Reset All"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {expandMore && (
                  <div className="p-3 pt-0 flex flex-col gap-3">
                    {/* Vocal Gender */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                        <span>Vocal Gender</span>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex items-center bg-[#0d1017] p-0.5 rounded-lg border border-[#1b212d]">
                        <button
                          onClick={() => setVocalGender('male')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                            vocalGender === 'male' ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          onClick={() => setVocalGender('female')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                            vocalGender === 'female' ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    {/* Duration Mode */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                        <span>Duration</span>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex items-center bg-[#0d1017] p-0.5 rounded-lg border border-[#1b212d]">
                        <button
                          onClick={() => setDurationMode('custom')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                            durationMode === 'custom' ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Custom
                        </button>
                        <button
                          onClick={() => setDurationMode('auto')}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                            durationMode === 'auto' ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    {/* Max Mode */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                        <span>Max Mode</span>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex items-center bg-[#0d1017] p-0.5 rounded-lg border border-[#1b212d]">
                        <button
                          onClick={() => setMaxMode(false)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            !maxMode ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Off
                        </button>
                        <button
                          onClick={() => setMaxMode(true)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            maxMode ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          On
                        </button>
                      </div>
                    </div>

                    {/* Weirdness Slider (Notched pink bar from screenshot!) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold w-24">
                        <span>Weirdness</span>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 relative flex items-center h-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={weirdness}
                            onChange={(e) => setWeirdness(Number(e.target.value))}
                            className="w-full accent-[#ff3366] h-1.5 bg-[#1b212d] rounded-lg cursor-pointer"
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-300 w-8 text-right">
                          {weirdness}%
                        </span>
                      </div>
                    </div>

                    {/* Style Influence Slider (Notched pink bar) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold w-24">
                        <span>Style Influence</span>
                        <Info className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 relative flex items-center h-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={styleInfluence}
                            onChange={(e) => setStyleInfluence(Number(e.target.value))}
                            className="w-full accent-[#ff3366] h-1.5 bg-[#1b212d] rounded-lg cursor-pointer"
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-300 w-8 text-right">
                          {styleInfluence}%
                        </span>
                      </div>
                    </div>

                    {/* Variety Slider */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold w-24">
                        <span>Variety</span>
                        <RotateCcw className="w-3 h-3 text-gray-500 cursor-pointer" onClick={() => setVariety('Extra')} />
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 relative flex items-center h-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            defaultValue="80"
                            className="w-full accent-[#ff3366] h-1.5 bg-[#1b212d] rounded-lg cursor-pointer"
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-300 w-8 text-right">
                          Extra
                        </span>
                      </div>
                    </div>

                    {/* Personalize: My Taste */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                        <span>Personalize</span>
                        <span className="text-[10px] text-gray-500 font-normal">My Taste</span>
                      </div>
                      <div className="flex items-center bg-[#0d1017] p-0.5 rounded-lg border border-[#1b212d]">
                        <button
                          onClick={() => setPersonalize(false)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            !personalize ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          Off
                        </button>
                        <button
                          onClick={() => setPersonalize(true)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            personalize ? 'bg-[#232a36] text-white' : 'text-gray-400'
                          }`}
                        >
                          On
                        </button>
                      </div>
                    </div>

                    {/* Song Title (Optional) */}
                    <div className="flex items-center gap-2 bg-[#0d1017] border border-[#1b212d] focus-within:border-[#ff3366] rounded-xl px-3 py-2">
                      <Music className="w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Song Title (Optional)"
                        className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none flex-1"
                      />
                    </div>

                    {/* Save to... (Workspace selector) */}
                    <div className="flex items-center justify-between bg-[#0d1017] border border-[#1b212d] rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Folder className="w-3.5 h-3.5" />
                        <span>Save to...</span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-200 bg-[#1a202c] px-2 py-0.5 rounded-lg border border-[#2b3545]">
                        My Workspace
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Actions Bar (Trash + Wide Create Button) */}
      <div className="p-3 border-t border-[#181c25] flex items-center gap-2 bg-[#0b0e13]">
        <button
          onClick={handleReset}
          title="Clear / Reset"
          className="w-10 h-10 rounded-xl bg-[#141822] hover:bg-[#1f2533] text-gray-400 hover:text-white border border-[#212836] flex items-center justify-center transition shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={isGenerating}
          className="flex-1 h-10 bg-[#1e2533] hover:bg-[#283244] disabled:opacity-50 text-white font-bold text-xs rounded-xl border border-[#2d374a] shadow-lg transition flex items-center justify-center gap-2 hover:border-[#ff3366]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#ff3366]" />
              <span>Generating Track...</span>
            </>
          ) : (
            <>
              <Music className="w-4 h-4 text-[#ff3366]" />
              <span>Create</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
