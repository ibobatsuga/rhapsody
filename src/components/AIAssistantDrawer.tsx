import React, { useState } from 'react';
import { AIProvider, AIGenerationResult } from '../types';
import { AIService } from '../services/aiService';
import { 
  Sparkles, 
  X, 
  Play, 
  Pause, 
  Plus, 
  Split, 
  Layers, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClipToDAW: (result: AIGenerationResult, audioUrl?: string, trackType?: 'audio' | 'synth' | 'drums') => void;
  onSplitStemsToDAW: (result: AIGenerationResult) => void;
}

const PRESET_PROMPTS = [
  { label: 'Synthwave 80s', prompt: 'Analog synthwave arpeggio, vintage drum machine, retro neon vibes, 120 bpm' },
  { label: 'Lo-Fi Chill Beat', prompt: 'Warm lo-fi hip hop groove, vinyl crackle, mellow rhodes chords, relaxed swing' },
  { label: 'Cyberpunk Dark Bass', prompt: 'Aggressive reese bassline, industrial cyber drums, heavy distortion, punchy kick' },
  { label: 'Acoustic Pop', prompt: 'Clean acoustic guitar fingerpicking, uplifting melody, subtle kick drum' },
  { label: 'Cinematic Strings', prompt: 'Emotional orchestral strings swell, cinematic brass horns, building intensity' },
  { label: 'Deep House Bass', prompt: 'Four on the floor club kick, rolling deep sub-bass groove, crisp hi-hats' }
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onAddClipToDAW,
  onSplitStemsToDAW
}) => {
  const [provider, setProvider] = useState<AIProvider>('suno');
  const [prompt, setPrompt] = useState('Vintage 80s analog synth arpeggio, driving bassline, retro vibes, 120 bpm');
  const [tags, setTags] = useState('synthwave, electronic, retro');
  const [title, setTitle] = useState('Cosmic Voyage');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(true);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Stored generation results
  const [results, setResults] = useState<AIGenerationResult[]>([
    {
      taskId: 'demo_stem_01',
      provider: 'suno',
      title: 'Neon Skyline (Synthwave Arp)',
      prompt: 'Analog synthwave arpeggio, vintage drum machine, 120 bpm',
      status: 'completed',
      audioUrls: ['https://actions.google.com/sounds/v1/music/ambient_hum.ogg'],
      vocalStemUrl: 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg',
      instrumentalStemUrl: 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg',
      duration: 32.0,
      createdAt: Date.now() - 100000
    }
  ]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() && !lyrics.trim()) return;

    setIsGenerating(true);
    setStatusMessage('Connecting to GoAPI gateway...');

    try {
      const apiKey = AIService.getApiKey();
      const mock = !apiKey; // auto-mock if no key is set yet

      const { taskId, mode } = await AIService.generateMusic({
        provider,
        prompt,
        tags,
        title,
        isInstrumental,
        lyrics: isCustomMode ? lyrics : undefined,
        mock
      });

      setStatusMessage(`Task accepted (${mode === 'simulation' ? 'Simulated AI' : 'Live GoAPI'}). Rendering stems...`);

      const result = await AIService.pollTask(taskId, provider, (status) => {
        setStatusMessage(`Processing audio with ${provider.toUpperCase()} (${status})...`);
      });

      setResults(prev => [result, ...prev]);
      setStatusMessage('');
    } catch (err: any) {
      console.error('Generation error:', err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePreview = (id: string, url: string) => {
    if (previewPlayingId === id) {
      previewAudio?.pause();
      setPreviewPlayingId(null);
    } else {
      if (previewAudio) {
        previewAudio.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPreviewPlayingId(null);
      setPreviewAudio(audio);
      setPreviewPlayingId(id);
    }
  };

  return (
    <div className="fixed top-16 right-0 bottom-0 w-[420px] bg-[#161b22] border-l border-[#30363d] shadow-2xl z-30 flex flex-col select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#e63946] to-[#9d4edd] flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Studio Assistant
              <span className="text-[10px] bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/30 px-1 py-0.2 rounded font-mono">
                GoAPI
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">Generate stems & insert directly into Rhapsody</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Model / Provider Switcher */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-300">AI Model Provider:</label>
          <div className="grid grid-cols-2 gap-2 bg-[#0e1117] p-1 rounded-lg border border-[#30363d]">
            <button
              onClick={() => setProvider('suno')}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                provider === 'suno'
                  ? 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Suno AI</span>
              <span className="text-[9px] bg-black/30 px-1 py-0.2 rounded">v3.5 / v4</span>
            </button>

            <button
              onClick={() => setProvider('udio')}
              className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                provider === 'udio'
                  ? 'bg-gradient-to-r from-[#9d4edd] to-[#c77dff] text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Udio AI</span>
              <span className="text-[9px] bg-black/30 px-1 py-0.2 rounded">v1.5</span>
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300">Prompt Description:</label>
            <button 
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-[11px] text-[#00f5d4] hover:underline flex items-center gap-1"
            >
              {isCustomMode ? 'Simple Mode' : '+ Custom Mode (Lyrics/Tags)'}
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Dreamy lo-fi hip hop beat with warm rhodes piano and mellow bassline..."
            rows={3}
            className="w-full bg-[#0e1117] border border-[#30363d] focus:border-[#e63946] rounded-lg p-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
          />

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {PRESET_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p.prompt)}
                className="text-[10px] bg-[#21262d] hover:bg-[#30363d] text-gray-300 px-2 py-0.8 rounded-full border border-[#30363d] transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Mode Fields (Title, Tags, Lyrics) */}
        {isCustomMode && (
          <div className="flex flex-col gap-3 p-3 bg-[#0e1117] rounded-lg border border-[#30363d]">
            <div>
              <label className="text-[11px] font-semibold text-gray-400">Track Title:</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded p-1.5 text-xs text-white mt-1 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400">Style / Tags:</label>
              <input 
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="synthwave, 120bpm, analog synth"
                className="w-full bg-[#161b22] border border-[#30363d] rounded p-1.5 text-xs text-white mt-1 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400">Custom Lyrics (Optional):</label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Dancing through the city lights...&#10;[Chorus]&#10;..."
                rows={3}
                className="w-full bg-[#161b22] border border-[#30363d] rounded p-1.5 text-xs text-white mt-1 focus:outline-none resize-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Instrumental Switch */}
        <div className="flex items-center justify-between p-2.5 bg-[#0e1117] border border-[#30363d] rounded-lg">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-200">Instrumental Only</span>
            <span className="text-[10px] text-gray-400">Generate music without vocal lyrics</span>
          </div>
          <button
            onClick={() => setIsInstrumental(!isInstrumental)}
            className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
              isInstrumental ? 'bg-[#52b788] justify-end' : 'bg-[#30363d] justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-[#e63946] via-[#ff4d6d] to-[#9d4edd] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#e63946]/25 transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating with {provider.toUpperCase()}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Stem with {provider === 'suno' ? 'Suno AI' : 'Udio AI'}</span>
            </>
          )}
        </button>

        {statusMessage && (
          <div className="p-2.5 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-[#00f5d4] flex items-center gap-2 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* History / Generated Results Section */}
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Generated Stems ({results.length})</span>
            <Layers className="w-3.5 h-3.5" />
          </h3>

          <div className="flex flex-col gap-2.5">
            {results.map((res) => (
              <div
                key={res.taskId}
                className="p-3 bg-[#0e1117] border border-[#30363d] hover:border-gray-500 rounded-xl flex flex-col gap-2.5 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                        res.provider === 'suno' ? 'bg-[#e63946]/20 text-[#e63946]' : 'bg-[#9d4edd]/20 text-[#9d4edd]'
                      }`}>
                        {res.provider}
                      </span>
                      <h4 className="text-xs font-bold text-white">{res.title}</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{res.prompt}</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{res.duration?.toFixed(0)}s</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#21262d]">
                  {/* Preview Player */}
                  <button
                    onClick={() => handleTogglePreview(res.taskId, res.audioUrls[0])}
                    className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg text-xs transition flex items-center gap-1"
                    title="Preview playback"
                  >
                    {previewPlayingId === res.taskId ? (
                      <Pause className="w-3.5 h-3.5 fill-current text-[#00f5d4]" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>

                  {/* Add to Timeline Button */}
                  <button
                    onClick={() => onAddClipToDAW(res, res.audioUrls[0], 'audio')}
                    className="flex-1 py-1.5 px-2 bg-[#52b788] hover:bg-[#74c69d] text-black font-bold text-xs rounded-lg transition flex items-center justify-center gap-1"
                    title="Insert directly into Rhapsody timeline as audio track"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Timeline</span>
                  </button>

                  {/* Split Stems Button */}
                  <button
                    onClick={() => onSplitStemsToDAW(res)}
                    className="py-1.5 px-2.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 text-xs rounded-lg border border-[#30363d] transition flex items-center gap-1"
                    title="Split into Vocal & Instrumental Tracks in DAW"
                  >
                    <Split className="w-3 h-3 text-[#00f5d4]" />
                    <span>Split Stems</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
