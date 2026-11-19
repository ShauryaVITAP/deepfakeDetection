import { AnalysisResult } from '../types';
import { 
  sendChatMessage, 
  generateForensicAuditReport, 
  fetchChatStatus,
  ChatModelInfo,
  ChatMessageRecord
} from './apiService';

export interface AiModelItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  is_primary?: boolean;
  is_fallback?: boolean;
}

export const GROQ_MODELS: AiModelItem[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile (Groq Primary Flagship)',
    description: 'High-capacity 70B parameter open reasoning engine running on Groq LPUs. Exceptional forensic analysis, coding, and legal deduction.',
    badge: 'Llama 3.3 70B',
    is_primary: true
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant (Groq Verified Fallback)',
    description: 'Ultra-low latency sub-second inference (~800 tok/sec) for rapid interactive responses.',
    badge: 'Llama 8B',
    is_fallback: true
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (Groq Verified)',
    description: 'Advanced open Mixture-of-Experts model accessible on Groq hardware with 32k context.',
    badge: 'Mixtral 8x7B'
  }
];

export const AI_MODELS = GROQ_MODELS;

// Active Model Preference in UI (Defaults to primary model: llama-3.3-70b-versatile)
export const getStoredAiModel = (): string => {
  const stored = localStorage.getItem('aegis_groq_model');
  if (stored && (stored.includes('120b') || stored.includes('20b') || stored.includes('gpt-oss'))) {
    localStorage.setItem('aegis_groq_model', 'llama-3.3-70b-versatile');
    return 'llama-3.3-70b-versatile';
  }
  return stored || 'llama-3.3-70b-versatile';
};

export const setStoredAiModel = (model: string): void => {
  localStorage.setItem('aegis_groq_model', model);
};

export const getStoredGroqModel = getStoredAiModel;
export const setStoredGroqModel = setStoredAiModel;

// Deprecated key getters kept for backward compatibility (all keys strictly in backend .env)
export const getStoredGroqApiKey = (): string => '';
export const setStoredGroqApiKey = (_key: string): void => {};
export const getStoredOpenAiApiKey = (): string => '';
export const setStoredOpenAiApiKey = (_key: string): void => {};

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Check backend Groq connection status
 */
export const testGroqConnection = async (): Promise<{ success: boolean; message: string }> => {
  const status = await fetchChatStatus();
  if (!status) {
    return { success: false, message: 'Backend server is offline (http://127.0.0.1:8000).' };
  }
  if (status.configured) {
    return { 
      success: true, 
      message: `Connected to Groq LPU (${status.masked_key}). Active model: ${status.active_model} (${status.models_count} verified models available).` 
    };
  }
  return { 
    success: false, 
    message: 'GROQ_API_KEY is not configured in backend .env file.' 
  };
};

export const testAiConnection = testGroqConnection;
export const testOpenAiConnection = testGroqConnection;

/**
 * Interactive Chat with Groq AI Assistant (Non-streaming wrapper)
 */
export const chatWithAiAssistant = async (
  conversation: GroqChatMessage[],
  analysis?: AnalysisResult,
  model = getStoredAiModel(),
  conversationId?: string
): Promise<string> => {
  const lastUserMsg = conversation[conversation.length - 1]?.content || '';
  const result = await sendChatMessage({
    message: lastUserMsg,
    messages: conversation,
    conversation_id: conversationId,
    model,
    case_dossier: analysis,
    temperature: 0.5,
    max_tokens: 2048
  });

  if (result.success && result.content) {
    return result.content;
  }
  if (result.error) {
    return result.error;
  }
  return 'No response received from Groq AI model.';
};

export const chatWithGroqCopilot = (
  conversation: GroqChatMessage[],
  analysis?: AnalysisResult,
  _apiKey?: string,
  model = getStoredAiModel()
) => chatWithAiAssistant(conversation, analysis, model);

/**
 * Generate comprehensive AI forensic audit synthesis via Backend Groq LLM
 */
export const generateAiForensicAudit = async (
  analysis: AnalysisResult,
  model = getStoredAiModel()
): Promise<string> => {
  try {
    const report = await generateForensicAuditReport(analysis, model);
    if (report) return report;
  } catch (err: any) {
    return `### Forensic Audit Notice\n\nCould not generate Groq forensic audit:\n\n*${err.message || err}*\n\nPlease verify your \`GROQ_API_KEY\` in backend \`.env\` file.`;
  }
  return 'No forensic audit output returned.';
};

export const generateGroqForensicAudit = generateAiForensicAudit;
