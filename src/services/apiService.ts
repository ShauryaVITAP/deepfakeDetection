import { AnalysisResult, GradCAMResponse } from '../types';
import { ExtractedFrame } from '../utils/videoExtractor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  model_loaded: boolean;
  class_label_mapping: Record<string, string>;
  thresholds: {
    manipulated_threshold: number;
    authentic_threshold: number;
  };
}

/**
 * Check if the Python FastAPI Forensic Backend is live
 */
export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Send extracted video frames to Python Backend for Real Forensic Inference
 */
export async function analyzeVideoWithBackend(
  fileMeta: {
    name: string;
    size: string;
    duration?: string;
    resolution?: string;
    fps?: number;
  },
  frames: ExtractedFrame[]
): Promise<AnalysisResult> {
  const payload = {
    video: {
      filename: fileMeta.name,
      filesize: fileMeta.size,
      duration: fileMeta.duration || "00:30",
      resolution: fileMeta.resolution || "1920x1080",
      fps: fileMeta.fps || 30
    },
    frames: frames.map(f => ({
      frameNumber: f.frameNumber,
      timestamp: f.timestamp,
      dataUrl: f.dataUrl
    }))
  };

  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Forensic Backend Error (${res.status}): ${errorText}`);
  }

  const data: AnalysisResult = await res.json();
  return data;
}

export interface ChatModelInfo {
  id: string;
  name: string;
  description: string;
  context_window?: number;
  is_default?: boolean;
}

export interface ChatStatusResponse {
  status: string;
  provider: 'groq';
  configured: boolean;
  masked_key: string;
  primary_model: string;
  fallback_model: string;
  active_model: string;
  connection_status: string;
  models_count: number;
  verified_models: string[];
}

export interface ChatConversationItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessageRecord {
  id: string;
  conversation_id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  provider?: string;
  model?: string;
  created_at?: string;
}

export interface ChatCompletionResponse {
  success: boolean;
  content: string;
  conversation_id?: string;
  model_used?: string;
  provider?: string;
  usage?: Record<string, any>;
  error?: string;
}

/**
 * Check backend Groq AI service configuration & provider status
 */
export async function fetchChatStatus(): Promise<ChatStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch verified models from official Groq Models API via backend
 */
export async function fetchChatModels(): Promise<{ 
  primary_model: string;
  fallback_model: string;
  active_model: string;
  verified_models: string[];
} | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/models`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch all conversations from SQLite chat database
 */
export async function fetchChatConversations(): Promise<ChatConversationItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data.conversations || [];
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch conversation history:', err);
    return [];
  }
}

/**
 * Fetch full messages for a specific conversation from SQLite
 */
export async function fetchConversationMessages(conversationId: string): Promise<ChatMessageRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/history?conversation_id=${encodeURIComponent(conversationId)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data.messages || [];
    }
    return [];
  } catch (err) {
    console.error(`Failed to fetch messages for conversation ${conversationId}:`, err);
    return [];
  }
}

/**
 * Delete a conversation and its messages from SQLite
 */
export async function deleteChatConversation(conversationId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/history/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Send chat conversation to backend Groq AI Assistant (Non-streaming JSON)
 */
export async function sendChatMessage(params: {
  message: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  conversation_id?: string;
  mode?: 'auto' | 'general' | 'forensic';
  model?: string;
  temperature?: number;
  max_tokens?: number;
  case_dossier?: AnalysisResult;
}): Promise<ChatCompletionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      message: params.message,
      messages: params.messages,
      conversation_id: params.conversation_id,
      mode: params.mode || 'auto',
      model: params.model,
      temperature: params.temperature ?? 0.5,
      max_tokens: params.max_tokens ?? 2048,
      stream: false,
      case_dossier: params.case_dossier
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chat API error (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Stream chat conversation with Server-Sent Events (SSE) via /api/chat/stream
 */
export async function streamChatMessage(params: {
  message: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  conversation_id?: string;
  mode?: 'auto' | 'general' | 'forensic';
  model?: string;
  temperature?: number;
  max_tokens?: number;
  case_dossier?: AnalysisResult;
  onToken: (token: string) => void;
  onDone: (meta: { conversation_id?: string; model?: string }) => void;
  onError: (errorMsg: string) => void;
  abortSignal?: AbortSignal;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        message: params.message,
        messages: params.messages,
        conversation_id: params.conversation_id,
        mode: params.mode || 'auto',
        model: params.model,
        temperature: params.temperature ?? 0.5,
        max_tokens: params.max_tokens ?? 2048,
        case_dossier: params.case_dossier
      }),
      signal: params.abortSignal
    });

    if (!response.ok) {
      const errText = await response.text();
      params.onError(`Backend Error (${response.status}): ${errText}`);
      return;
    }

    if (!response.body) {
      params.onError('No response stream received from backend.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'token' && data.content) {
              params.onToken(data.content);
            } else if (data.type === 'done') {
              params.onDone({
                conversation_id: data.conversation_id,
                model: data.model
              });
            } else if (data.type === 'error') {
              params.onError(data.error || 'Unknown stream error');
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      params.onDone({});
    } else {
      params.onError(err.message || 'Stream connection failed.');
    }
  }
}

/**
 * Generate full forensic audit synthesis via backend Groq AI service
 */
export async function generateForensicAuditReport(
  analysis: AnalysisResult,
  model?: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/chat/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      analysis,
      model
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Audit API error (${res.status}): ${errorText}`);
  }

  const data: ChatCompletionResponse = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.content;
}

/**
 * Generate genuine Grad-CAM explainability heatmap and overlay via PyTorch EfficientNet-B0 backend
 */
export async function generateGradCAM(params: {
  frame_base64: string;
  target_class?: 'predicted' | 'fake' | 'real';
  intensity?: 'low' | 'medium' | 'high';
  overlay_alpha?: number;
}): Promise<GradCAMResponse> {
  const res = await fetch(`${API_BASE_URL}/api/gradcam/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Grad-CAM API error (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Check PyTorch Grad-CAM backend service status
 */
export async function getGradCAMStatus(): Promise<{
  status: string;
  model: string;
  target_layer: string;
  device: string;
  is_trained: boolean;
}> {
  const res = await fetch(`${API_BASE_URL}/api/gradcam/status`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Grad-CAM status error: ${res.status}`);
  }
  return await res.json();
}

