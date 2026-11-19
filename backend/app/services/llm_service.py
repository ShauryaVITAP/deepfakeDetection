import os
import json
import re
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
import httpx
from dotenv import load_dotenv

from ..db import chat_db

# Load environment variables
load_dotenv()

# Provider Endpoints
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Model Catalog
SUPPORTED_OPENAI_MODELS = [
    {
        "id": "gpt-4o-mini",
        "name": "OpenAI GPT-4o Mini",
        "description": "Ultra-fast, smart & affordable model for general Q&A and coding (ChatGPT-grade).",
        "context_window": 128000,
        "provider": "openai",
        "is_default": True
    },
    {
        "id": "gpt-4o",
        "name": "OpenAI GPT-4o (Flagship)",
        "description": "High-intelligence multimodal reasoning for deep architecture and forensic synthesis.",
        "context_window": 128000,
        "provider": "openai",
        "is_default": False
    },
    {
        "id": "o3-mini",
        "name": "OpenAI o3-mini (Reasoning)",
        "description": "Specialized deep STEM, mathematical, and algorithmic reasoning engine.",
        "context_window": 200000,
        "provider": "openai",
        "is_default": False
    }
]

SUPPORTED_GROQ_MODELS = [
    {
        "id": "llama-3.1-8b-instant",
        "name": "Groq Llama 3.1 8B Instant",
        "description": "Ultra-fast inference (~800 tok/sec), universally accessible on all Groq tiers.",
        "context_window": 128000,
        "provider": "groq",
        "is_default": True
    },
    {
        "id": "llama-3.3-70b-versatile",
        "name": "Groq Llama 3.3 70B Versatile",
        "description": "Flagship 70B open-weights reasoning model running on Groq LPUs.",
        "context_window": 128000,
        "provider": "groq",
        "is_default": False
    },
    {
        "id": "gemma2-9b-it",
        "name": "Groq Gemma 2 9B IT",
        "description": "Google instruction-tuned conversational model on Groq hardware.",
        "context_window": 8192,
        "provider": "groq",
        "is_default": False
    }
]

ALL_MODELS = SUPPORTED_OPENAI_MODELS + SUPPORTED_GROQ_MODELS


def get_default_provider() -> str:
    prov = os.environ.get("DEFAULT_AI_PROVIDER", "openai").strip().lower()
    return prov if prov in ["openai", "groq"] else "openai"


def get_default_model(provider: Optional[str] = None) -> str:
    prov = provider or get_default_provider()
    env_model = os.environ.get("DEFAULT_AI_MODEL", "").strip()
    if env_model:
        return env_model
    return "gpt-4o-mini" if prov == "openai" else "llama-3.1-8b-instant"


def resolve_provider(model_name: Optional[str], requested_provider: Optional[str] = None) -> str:
    if requested_provider in ["openai", "groq"]:
        return requested_provider
    if not model_name:
        return get_default_provider()
    m = model_name.lower()
    if m.startswith("gpt-") or m.startswith("o1-") or m.startswith("o3-"):
        return "openai"
    if "llama" in m or "gemma" in m or "mixtral" in m:
        return "groq"
    return get_default_provider()


def get_api_key_for_provider(provider: str) -> Optional[str]:
    load_dotenv(override=True)
    if provider == "openai":
        k = os.environ.get("OPENAI_API_KEY", "").strip()
        return k if (k and (k.startswith("sk-") or len(k) > 10)) else None
    elif provider == "groq":
        k = os.environ.get("GROQ_API_KEY", "").strip()
        return k if (k and (k.startswith("gsk_") or len(k) > 10)) else None
    return None


def mask_key(key: Optional[str]) -> str:
    if not key or len(key) < 8:
        return "Not Set"
    return f"{key[:4]}...{key[-4:]}"


def build_system_prompt(case_dossier: Optional[Dict[str, Any]] = None, is_project_query: bool = False) -> str:
    base = """You are **Aegis AI**, a powerful, highly intelligent, and general-purpose conversational AI assistant (similar to ChatGPT).

### Your Core Directives:
1. **General-Purpose Intelligence**:
   - You can answer ANY question on ANY subject: computer science, software engineering, algorithms, data structures, mathematics, science, history, philosophy, languages, creative writing, everyday reasoning, and casual conversations.
   - Provide accurate, well-structured, and helpful answers.
   - When explaining code or algorithms (Python, Java, C++, JavaScript, SQL, Rust, Go, etc.), provide clean, commented, and syntactically valid code blocks with time & space complexity analysis.
   - For mathematics, explain formulas step-by-step.
   - Maintain a friendly, clear, and professional tone.

2. **Conversation & Context Continuity**:
   - Understand the user's intent. Answer follow-up questions naturally based on previous conversation history.
   - Be concise when appropriate, and thorough when detailed explanations or implementations are requested.

3. **AegisVision Deepfake Detection Awareness**:
   - You are also integrated into the AegisVision AI Digital Media Forensics platform.
   - If the user asks about deepfakes, video authenticity, forensic analysis, 2D Fourier (FFT) frequencies, PRNU sensor noise, Wav2Lip audio-visual sync, or court admissibility (Federal Rule of Evidence 901, Indian Evidence Act Section 65B), provide deep forensic expertise.
   - If asked about project debugging or issues (e.g. inverted predictions), you know that the root causes were: offscreen canvas rendering black frames in Chromium without DOM attachment, and inverted classifier labels, which have now been properly calibrated.
"""

    if is_project_query or (case_dossier and case_dossier.get("video")):
        if case_dossier and case_dossier.get("video"):
            vid = case_dossier.get("video", {})
            base += f"""
### Active Evidence Media File:
- Filename: `{vid.get('filename', 'Unknown')}`
- Resolution: `{vid.get('resolution', 'N/A')}`, Duration: `{vid.get('duration', 'N/A')}`
- Verdict: **{case_dossier.get('verdict', 'PENDING')}** (Confidence: {case_dossier.get('confidence', 0)}%, Deepfake Score: {case_dossier.get('overallScore', 0)}%)
- Spatial Coherence: {case_dossier.get('metrics', {}).get('spatialCoherence', 'N/A')}%, Temporal: {case_dossier.get('metrics', {}).get('temporalConsistency', 'N/A')}%
"""
    return base


def is_query_about_project(text: str) -> bool:
    keywords = [
        "deepfake", "authentic", "manipulated", "synthetic", "fft", "fourier", 
        "prnu", "wav2lip", "court", "admissib", "evidence", "facial", "biometric",
        "aegis", "project", "detection", "frame #", "what went wrong"
    ]
    t = text.lower()
    return any(k in t for k in keywords)


class BackendLLMService:
    def __init__(self):
        pass

    def get_status(self) -> Dict[str, Any]:
        openai_key = get_api_key_for_provider("openai")
        groq_key = get_api_key_for_provider("groq")
        def_prov = get_default_provider()
        def_model = get_default_model(def_prov)

        return {
            "status": "online",
            "default_provider": def_prov,
            "default_model": def_model,
            "providers": {
                "openai": {
                    "configured": bool(openai_key),
                    "masked_key": mask_key(openai_key),
                    "supported_models": [m["id"] for m in SUPPORTED_OPENAI_MODELS]
                },
                "groq": {
                    "configured": bool(groq_key),
                    "masked_key": mask_key(groq_key),
                    "supported_models": [m["id"] for m in SUPPORTED_GROQ_MODELS]
                }
            },
            "models": ALL_MODELS
        }

    def _prepare_context(
        self,
        conversation_id: str,
        user_message: str,
        case_dossier: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, str]]:
        # Fetch sliding history from SQLite
        history = chat_db.get_conversation_history(conversation_id, limit=12)
        
        # Check if project context should be activated
        is_proj = is_query_about_project(user_message) or bool(case_dossier)
        system_prompt = build_system_prompt(case_dossier=case_dossier, is_project_query=is_proj)
        
        formatted_messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            formatted_messages.append({"role": msg["role"], "content": msg["content"]})
            
        formatted_messages.append({"role": "user", "content": user_message})
        return formatted_messages

    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        conversation_id: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.5,
        max_tokens: int = 1500,
        case_dossier: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Non-streaming complete response generator."""
        conv_id = chat_db.get_or_create_conversation(conversation_id)
        
        last_user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_msg = m.get("content", "").strip()
                break

        # Save user message to database
        if last_user_msg:
            chat_db.save_message(conv_id, "user", last_user_msg)
            # Update title if new conversation
            chat_db.update_conversation_title(conv_id, last_user_msg[:60])

        target_provider = resolve_provider(model, provider)
        target_model = model or get_default_model(target_provider)
        api_key = get_api_key_for_provider(target_provider)

        if not api_key:
            err_msg = (
                f"**{target_provider.upper()} API Key Missing**\n\n"
                f"Please add your `{target_provider.upper()}_API_KEY` to the `.env` file on the backend server.\n\n"
                f"1. Open the project root `.env` file.\n"
                f"2. Add: `{target_provider.upper()}_API_KEY=your_key_here`\n"
                f"3. Save the file and restart the backend."
            )
            chat_db.save_message(conv_id, "assistant", err_msg, provider=target_provider, model=target_model)
            return {
                "success": False,
                "error": err_msg,
                "conversation_id": conv_id,
                "provider": target_provider,
                "model_used": target_model
            }

        endpoint = OPENAI_API_URL if target_provider == "openai" else GROQ_API_URL
        full_context = self._prepare_context(conv_id, last_user_msg, case_dossier)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": full_context,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(endpoint, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choice = data.get("choices", [{}])[0]
                    content = choice.get("message", {}).get("content", "")
                    
                    # Save assistant message to SQLite
                    chat_db.save_message(conv_id, "assistant", content, provider=target_provider, model=target_model)
                    
                    return {
                        "success": True,
                        "content": content,
                        "conversation_id": conv_id,
                        "provider": target_provider,
                        "model_used": target_model,
                        "usage": data.get("usage", {})
                    }
                else:
                    err_data = resp.json() if "application/json" in resp.headers.get("content-type", "") else {}
                    err_desc = err_data.get("error", {}).get("message", resp.text)
                    err_msg = f"**{target_provider.upper()} API Error ({resp.status_code})**: {err_desc}"
                    chat_db.save_message(conv_id, "assistant", err_msg, provider=target_provider, model=target_model)
                    return {
                        "success": False,
                        "error": err_msg,
                        "conversation_id": conv_id,
                        "provider": target_provider,
                        "model_used": target_model
                    }
        except Exception as e:
            err_msg = f"**Connection Error**: Failed to reach {target_provider.upper()} API: {str(e)}"
            chat_db.save_message(conv_id, "assistant", err_msg, provider=target_provider, model=target_model)
            return {
                "success": False,
                "error": err_msg,
                "conversation_id": conv_id,
                "provider": target_provider,
                "model_used": target_model
            }

    async def stream_completion(
        self,
        messages: List[Dict[str, str]],
        conversation_id: Optional[str] = None,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.5,
        max_tokens: int = 1500,
        case_dossier: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """SSE streaming generator yielding tokens token-by-token."""
        conv_id = chat_db.get_or_create_conversation(conversation_id)

        last_user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_msg = m.get("content", "").strip()
                break

        # Save user message to database
        if last_user_msg:
            chat_db.save_message(conv_id, "user", last_user_msg)
            chat_db.update_conversation_title(conv_id, last_user_msg[:60])

        target_provider = resolve_provider(model, provider)
        target_model = model or get_default_model(target_provider)
        api_key = get_api_key_for_provider(target_provider)

        if not api_key:
            err_msg = (
                f"**{target_provider.upper()} API Key Missing**\n\n"
                f"Please configure your `{target_provider.upper()}_API_KEY` in the project `.env` file on the backend server to activate the AI Assistant."
            )
            chat_db.save_message(conv_id, "assistant", err_msg, provider=target_provider, model=target_model)
            yield f"data: {json.dumps({'type': 'token', 'content': err_msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'provider': target_provider, 'model': target_model})}\n\n"
            return

        endpoint = OPENAI_API_URL if target_provider == "openai" else GROQ_API_URL
        full_context = self._prepare_context(conv_id, last_user_msg, case_dossier)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": full_context,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        full_reply = []

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", endpoint, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        raw_err = await response.aread()
                        try:
                            err_json = json.loads(raw_err.decode())
                            err_desc = err_json.get("error", {}).get("message", raw_err.decode())
                        except Exception:
                            err_desc = raw_err.decode()
                        err_msg = f"**{target_provider.upper()} Error ({response.status_code})**: {err_desc}"
                        chat_db.save_message(conv_id, "assistant", err_msg, provider=target_provider, model=target_model)
                        yield f"data: {json.dumps({'type': 'token', 'content': err_msg})}\n\n"
                        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'provider': target_provider, 'model': target_model})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if not line or not line.strip():
                            continue
                        line = line.strip()
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                token = delta.get("content", "")
                                if token:
                                    full_reply.append(token)
                                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                            except Exception:
                                continue

            # Finalize and persist assistant response
            complete_text = "".join(full_reply)
            if complete_text:
                chat_db.save_message(conv_id, "assistant", complete_text, provider=target_provider, model=target_model)
                
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'provider': target_provider, 'model': target_model})}\n\n"

        except Exception as e:
            err_msg = f"**Stream Interrupted**: {str(e)}"
            if full_reply:
                chat_db.save_message(conv_id, "assistant", "".join(full_reply), provider=target_provider, model=target_model)
            yield f"data: {json.dumps({'type': 'token', 'content': f'\\n\\n{err_msg}'})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'provider': target_provider, 'model': target_model})}\n\n"


# Singleton Service Instance
llm_service = BackendLLMService()
