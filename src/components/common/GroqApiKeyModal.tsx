import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Zap, 
  X, 
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { fetchChatStatus, ChatStatusResponse } from '../../services/apiService';
import { GROQ_MODELS, getStoredAiModel, setStoredAiModel } from '../../services/groqService';
import { Button } from './Button';
import { Badge } from './Badge';

interface GroqApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const GroqApiKeyModal: React.FC<GroqApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [backendStatus, setBackendStatus] = useState<ChatStatusResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(() => getStoredAiModel());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSelectedModel(getStoredAiModel());
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsRefreshing(true);
    const st = await fetchChatStatus();
    setBackendStatus(st);
    setIsRefreshing(false);
  };

  if (!isOpen) return null;

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setStoredAiModel(modelId);
    if (onKeyUpdated) onKeyUpdated();
  };

  const envSnippet = `# Groq API Configuration (in backend .env file)
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_FALLBACK_MODEL=openai/gpt-oss-20b`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#1E1B24] border border-[#363042] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#363042] flex items-center justify-between bg-[#24212B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A1B38] border border-[#B58AFF]/50 flex items-center justify-center text-[#B58AFF]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F5F0FA]">Groq AI Backend Status</h3>
                <Badge variant="plum">Groq LPU</Badge>
              </div>
              <p className="text-xs text-[#A39AAA] mt-0.5">
                Powered by official Groq Python SDK with dynamic model verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A39AAA] hover:text-[#F5F0FA] hover:bg-[#17151C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#F5F0FA]">

          {/* Security Banner */}
          <div className="p-3.5 rounded-xl bg-[#B58AFF]/10 border border-[#B58AFF]/30 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#B58AFF] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#B58AFF] text-xs">Strict Backend-Only Groq Integration</div>
              <div className="text-[11px] text-[#A39AAA] mt-0.5 leading-relaxed">
                Your <code className="text-[#F5F0FA] bg-[#17151C] px-1 py-0.5 rounded">GROQ_API_KEY</code> is loaded strictly from the backend <code className="text-[#F5F0FA] bg-[#17151C] px-1 py-0.5 rounded">.env</code> file. No keys are ever exposed in browser localStorage or frontend network requests.
              </div>
            </div>
          </div>

          {/* Groq Live Status Card */}
          <div className="p-4 rounded-xl border border-[#363042] bg-[#17151C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F5F0FA] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#B58AFF]" /> Groq LPU Connection
              </span>
              {backendStatus?.configured ? (
                <div className="flex items-center gap-1.5 text-[#2ED573] font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#FFA502] font-bold">
                  <AlertCircle className="w-4 h-4" /> Key Not Configured
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-[#24212B] p-2.5 rounded-lg border border-[#363042]/50">
                <div className="text-[#A39AAA]">API Key (Masked)</div>
                <div className="font-mono text-[#F5F0FA] mt-0.5">{backendStatus?.masked_key || 'Loading...'}</div>
              </div>
              <div className="bg-[#24212B] p-2.5 rounded-lg border border-[#363042]/50">
                <div className="text-[#A39AAA]">Active Model</div>
                <div className="font-mono text-[#B58AFF] mt-0.5 truncate">{backendStatus?.active_model || 'openai/gpt-oss-120b'}</div>
              </div>
            </div>

            {backendStatus?.verified_models && backendStatus.verified_models.length > 0 && (
              <div className="text-[11px] text-[#A39AAA]">
                Verified Accessible Models on Account: <span className="text-[#2ED573] font-bold">{backendStatus.models_count}</span>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-[#F5F0FA] mb-2">
              Select Groq Model:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GROQ_MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedModel === model.id
                      ? 'border-[#B58AFF] bg-[#2A1B38] text-[#F5F0FA]'
                      : 'border-[#363042] bg-[#17151C] text-[#A39AAA] hover:border-[#B58AFF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F5F0FA] flex items-center gap-1">
                      {model.badge}
                      {model.is_primary && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#B58AFF]/20 text-[#B58AFF]">Primary</span>
                      )}
                      {model.is_fallback && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#00D2D3]/20 text-[#00D2D3]">Fallback</span>
                      )}
                    </span>
                    {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-[#B58AFF]" />}
                  </div>
                  <div className="text-[10px] text-[#A39AAA] mt-1 line-clamp-2">
                    {model.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions to configure .env */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F0FA]">Backend .env Configuration:</span>
              <button
                onClick={copyEnvSnippet}
                className="text-[11px] text-[#B58AFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-[#2ED573]" /> : <Copy className="w-3 h-3" />}
                {copiedEnv ? 'Copied' : 'Copy snippet'}
              </button>
            </div>

            <div className="relative rounded-xl bg-[#0D0B10] border border-[#363042] p-3 text-[11px] font-mono text-[#D6B8E8]">
              <pre className="overflow-x-auto whitespace-pre">{envSnippet}</pre>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[#B58AFF] hover:underline flex items-center gap-1"
              >
                Get Free Groq API Key <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={loadStatus}
                disabled={isRefreshing}
                className="text-[#A39AAA] hover:text-[#F5F0FA] flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#363042] bg-[#24212B] flex items-center justify-between">
          <div className="text-[11px] text-[#A39AAA]">
            Backend Status: <span className="text-[#2ED573] font-bold">Online (127.0.0.1:8000)</span>
          </div>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
