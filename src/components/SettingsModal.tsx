import React, { useState, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { X, Key, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(AIService.getApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    AIService.setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e63946]/20 flex items-center justify-center text-[#e63946]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rhapsody Studio Settings</h3>
              <p className="text-[11px] text-gray-400">GoAPI Integration & Audio Preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 bg-[#0e1117]">
          {/* GoAPI Key Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-200">GoAPI Key (`X-API-Key`):</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your GoAPI key (e.g. key_xxx...)"
              className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#e63946] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
            />
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Powers both **Suno AI** and **Udio AI** generation endpoints through GoAPI gateway.
            </p>
          </div>

          <div className="p-3 bg-[#161b22] rounded-xl border border-[#30363d] flex items-start gap-2 text-xs text-gray-300">
            <Info className="w-4 h-4 text-[#00f5d4] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Simulation Mode:</strong> If no API key is entered, Rhapsody automatically runs in high-fidelity simulation mode with synthesized demo loops so you can test all timeline insertion and mixing features right away!
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-[#e63946] hover:bg-[#ff4d6d] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-[#e63946]/20"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved to Local Storage!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>

        <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between text-[11px] text-gray-400">
          <span>Engine: WebAudio 44.1kHz</span>
          <button onClick={onClose} className="hover:text-white transition">Close</button>
        </div>
      </div>
    </div>
  );
};
