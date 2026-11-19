import os
import json
import time
import re
from typing import List, Dict, Any, Optional, AsyncGenerator
from dotenv import load_dotenv
import groq
from groq import AsyncGroq, Groq

from .db import chat_db

# Load environment variables from .env
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
load_dotenv(ENV_PATH, override=True)

DEFAULT_PRIMARY_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b").strip()
DEFAULT_FALLBACK_MODEL = os.environ.get("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b").strip()

def get_groq_api_key() -> Optional[str]:
    load_dotenv(ENV_PATH, override=True)
    k = os.environ.get("GROQ_API_KEY", "").strip()
    return k if (k and k.startswith("gsk_")) else None

def mask_api_key(key: Optional[str]) -> str:
    if not key or len(key) < 10:
        return "Not Configured"
    return f"{key[:6]}...{key[-4:]}"

def is_project_related_query(text: str) -> bool:
    """Detect if user query is asking about the deepfake detection project or forensics."""
    keywords = [
        "deepfake", "authentic", "manipulated", "synthetic", "fft", "fourier", 
        "prnu", "wav2lip", "court", "admissib", "evidence", "facial", "biometric",
        "aegis", "aegisvision", "detection", "frame #", "what went wrong with my project",
        "what went wrong", "invert", "inverted", "vice versa", "opposite prediction"
    ]
    t = text.lower()
    return any(k in t for k in keywords)

def build_system_prompt(is_project_query: bool = False, case_dossier: Optional[Dict[str, Any]] = None) -> str:
    base = """You are **Aegis AI**, a world-class, intelligent, general-purpose AI assistant (similar to ChatGPT and Flipkart's intelligent conversational AI).

### Core Directives:
1. **General-Purpose Intelligence**:
   - You can answer ANY question on ANY subject: software engineering, Python, Java, C++, JavaScript, SQL, DSA, competitive programming, mathematics, physics, biology, history, philosophy, logic, creative writing, everyday reasoning, and casual conversations.
   - You are fluent in English, Hindi, and Hinglish. Understand and respond naturally in the user's preferred language.
   - When asked for code, always provide clean, production-grade, syntactically complete code blocks with comments, followed by time & space complexity analysis (e.g. O(log n), O(1)).
   - When explaining concepts, be clear, articulate, and structured with Markdown headers and bullet points.
   - Understand context and multi-turn follow-up questions naturally without asking unnecessary clarifications.
   - Never restrict yourself to only project-related topics. Never force unrelated general questions into deepfake or forensic discussions.

2. **AegisVision Deepfake Forensic Intelligence**:
   - You possess expert knowledge of the **AegisVision AI Digital Media Forensics & Deepfake Detection System**.
   - If (and only if) the user asks about media forensics, deepfakes, or project diagnosis, you provide deep scientific insights into:
     - 2D Fourier (FFT) azimuthal frequency harmonics (detecting transposed convolution checkerboard artifacts).
     - PRNU (Photo-Response Non-Uniformity) sensor noise continuity.
     - Wav2Lip multi-modal acoustic-visual temporal desynchronization (>180ms offset indicates voice cloning).
     - Statutory court admissibility under Federal Rule of Evidence 901 and Section 65B of the Indian Evidence Act with SHA-256 cryptographic hashes.
     - Project root-cause diagnosis: Inverted predictions were caused by Chromium offscreen blank canvas frames (0x00) and uncalibrated class boundaries, both of which are fully resolved with the calibrated ensemble model.
"""

    if is_project_query or (case_dossier and case_dossier.get("video")):
        if case_dossier and case_dossier.get("video"):
            vid = case_dossier.get("video", {})
            base += f"""
### Active Forensic Media Case File:
- Target Media: `{vid.get('filename', 'Unknown')}`
- Resolution: `{vid.get('resolution', 'N/A')}`, Duration: `{vid.get('duration', 'N/A')}`
- Live Model Verdict: **{case_dossier.get('verdict', 'PENDING')}** (Confidence: {case_dossier.get('confidence', 0)}%, Deepfake Probability: {case_dossier.get('overallScore', 0)}%)
- Spatial Coherence: {case_dossier.get('metrics', {}).get('spatialCoherence', 'N/A')}%, Temporal Consistency: {case_dossier.get('metrics', {}).get('temporalConsistency', 'N/A')}%
"""
    return base


class GroqChatService:
    def __init__(self):
        self.primary_model = DEFAULT_PRIMARY_MODEL
        self.fallback_model = DEFAULT_FALLBACK_MODEL
        self._verified_models: List[str] = []
        self._last_verified_time: float = 0

    def _get_async_client(self) -> AsyncGroq:
        api_key = get_groq_api_key()
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured in backend .env file.")
        return AsyncGroq(api_key=api_key, timeout=60.0)

    def _get_sync_client(self) -> Groq:
        api_key = get_groq_api_key()
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured in backend .env file.")
        return Groq(api_key=api_key, timeout=30.0)

    def verify_available_models(self, force_refresh: bool = False) -> List[str]:
        """Query official Groq Models API to verify active accessible models."""
        now = time.time()
        if self._verified_models and not force_refresh and (now - self._last_verified_time < 300):
            return self._verified_models

        try:
            client = self._get_sync_client()
            models_res = client.models.list()
            self._verified_models = [m.id for m in models_res.data]
            self._last_verified_time = now
            print(f"[GroqChatService] Verified {len(self._verified_models)} models accessible on Groq account.")
            return self._verified_models
        except Exception as e:
            print(f"[GroqChatService] Model verification warning: {str(e)}")
            # If verification call fails (e.g. network blip), return sensible defaults
            return [self.primary_model, self.fallback_model]

    def resolve_model(self, requested_model: Optional[str] = None) -> str:
        """Resolve requested model or pick best verified model."""
        verified = self.verify_available_models()
        
        # 1. If explicit model requested and verified
        if requested_model and requested_model in verified:
            return requested_model

        # 2. Primary configured model (openai/gpt-oss-120b)
        if self.primary_model in verified:
            return self.primary_model

        # 3. Fallback configured model (openai/gpt-oss-20b)
        if self.fallback_model in verified:
            return self.fallback_model

        # 4. First conversational model from verified list
        for m in verified:
            if "oss" in m or "llama" in m or "qwen" in m:
                return m

        return self.primary_model

    def get_service_status(self) -> Dict[str, Any]:
        """Returns Groq configuration, connectivity status, and model info."""
        api_key = get_groq_api_key()
        is_configured = bool(api_key)
        verified_models = []
        connection_status = "unconfigured"

        if is_configured:
            try:
                verified_models = self.verify_available_models()
                connection_status = "connected"
            except Exception as e:
                connection_status = f"error: {str(e)}"

        active_resolved = self.resolve_model()

        return {
            "status": "online",
            "provider": "groq",
            "configured": is_configured,
            "masked_key": mask_api_key(api_key),
            "primary_model": self.primary_model,
            "fallback_model": self.fallback_model,
            "active_model": active_resolved,
            "connection_status": connection_status,
            "models_count": len(verified_models),
            "verified_models": verified_models[:15]
        }

    def _prepare_context(
        self,
        conversation_id: str,
        user_message: str,
        case_dossier: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, str]]:
        """Construct alternating multi-turn conversation context from SQLite with token safety."""
        history = chat_db.get_conversation_history(conversation_id, limit=6)
        is_proj = is_project_related_query(user_message) or bool(case_dossier)
        system_prompt = build_system_prompt(is_project_query=is_proj, case_dossier=case_dossier)

        formatted_messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            # Enforce strict alternating roles (no consecutive user or assistant messages)
            if formatted_messages and formatted_messages[-1]["role"] == msg["role"]:
                continue
            # Cap previous message content to 1200 chars to avoid exceeding Groq TPM limits
            c = msg["content"]
            if len(c) > 1200:
                c = c[:1200] + "..."
            formatted_messages.append({"role": msg["role"], "content": c})

        # Ensure the conversation ends with the current user message
        if not formatted_messages or formatted_messages[-1]["role"] != "user":
            formatted_messages.append({"role": "user", "content": user_message})
        elif formatted_messages[-1]["content"] != user_message:
            formatted_messages.append({"role": "user", "content": user_message})

        return formatted_messages

    async def chat_completion(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.5,
        max_tokens: int = 1024,
        case_dossier: Optional[Dict[str, Any]] = None,
        is_retry: bool = False
    ) -> Dict[str, Any]:
        """Generate non-streaming JSON completion via Groq with automatic fallback recovery."""
        conv_id = chat_db.get_or_create_conversation(conversation_id)

        # Save user message to database & update title (only on primary attempt)
        if not is_retry:
            chat_db.save_message(conv_id, "user", user_message)
            chat_db.update_conversation_title(conv_id, user_message[:60])

        target_model = self.resolve_model(model)

        try:
            client = self._get_async_client()
            context_messages = self._prepare_context(conv_id, user_message, case_dossier)

            response = await client.chat.completions.create(
                model=target_model,
                messages=context_messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            assistant_content = response.choices[0].message.content or ""
            
            # Save assistant reply to database
            chat_db.save_message(conv_id, "assistant", assistant_content, provider="groq", model=target_model)

            return {
                "success": True,
                "content": assistant_content,
                "conversation_id": conv_id,
                "model_used": target_model,
                "provider": "groq",
                "usage": {
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(response.usage, "completion_tokens", 0)
                }
            }

        except groq.AuthenticationError:
            err_msg = "**Groq Authentication Error (401)**: Invalid Groq API Key. Please verify your `GROQ_API_KEY` in the `.env` file."
            chat_db.save_message(conv_id, "assistant", err_msg, provider="groq", model=target_model)
            return {"success": False, "error": err_msg, "conversation_id": conv_id}

        except (groq.RateLimitError, groq.NotFoundError, groq.APIStatusError, groq.APIConnectionError) as e:
            status_code = getattr(e, "status_code", None)
            err_str = str(e).lower()
            is_recoverable = (
                isinstance(e, (groq.RateLimitError, groq.NotFoundError, groq.APIConnectionError)) or
                status_code in [404, 408, 413, 429, 500, 502, 503, 504] or
                "rate_limit" in err_str or
                "tpm" in err_str or
                "too large" in err_str or
                "connection" in err_str or
                "timeout" in err_str
            )
            if is_recoverable and target_model != self.fallback_model:
                print(f"[GroqChatService] Recovering from {type(e).__name__} on {target_model}. Retrying with verified fallback: {self.fallback_model}")
                return await self.chat_completion(
                    user_message=user_message,
                    conversation_id=conv_id,
                    model=self.fallback_model,
                    temperature=temperature,
                    max_tokens=min(max_tokens, 1024),
                    case_dossier=case_dossier,
                    is_retry=True
                )
            err_msg = f"**Groq Error ({status_code or 'Status'})**: {str(e)}"
            chat_db.save_message(conv_id, "assistant", err_msg, provider="groq", model=target_model)
            return {"success": False, "error": err_msg, "conversation_id": conv_id}

        except Exception as e:
            err_str = str(e).lower()
            if target_model != self.fallback_model and (
                "rate_limit" in err_str or 
                "tpm" in err_str or 
                "too large" in err_str or
                "connection" in err_str or 
                "timeout" in err_str
            ):
                print(f"[GroqChatService] Recovering from exception on {target_model}. Retrying with fallback: {self.fallback_model}")
                return await self.chat_completion(
                    user_message=user_message,
                    conversation_id=conv_id,
                    model=self.fallback_model,
                    temperature=temperature,
                    max_tokens=min(max_tokens, 1024),
                    case_dossier=case_dossier,
                    is_retry=True
                )
            print(f"[GroqChatService] Completion Exception: {type(e).__name__} - {str(e)}")
            err_msg = f"**Groq API Error**: {str(e)}"
            chat_db.save_message(conv_id, "assistant", err_msg, provider="groq", model=target_model)
            return {"success": False, "error": err_msg, "conversation_id": conv_id}

    async def stream_chat(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.5,
        max_tokens: int = 2048,
        case_dossier: Optional[Dict[str, Any]] = None,
        is_retry: bool = False
    ) -> AsyncGenerator[str, None]:
        """Real-time token-by-token SSE streaming via official Groq Async SDK."""
        conv_id = chat_db.get_or_create_conversation(conversation_id)

        # Save user message to database & update title (only on primary attempt)
        if not is_retry:
            chat_db.save_message(conv_id, "user", user_message)
            chat_db.update_conversation_title(conv_id, user_message[:60])

        target_model = self.resolve_model(model)
        full_response: List[str] = []

        try:
            client = self._get_async_client()
            context_messages = self._prepare_context(conv_id, user_message, case_dossier)

            stream = await client.chat.completions.create(
                model=target_model,
                messages=context_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta:
                    token = chunk.choices[0].delta.content or ""
                    if token:
                        full_response.append(token)
                        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            complete_text = "".join(full_response)
            if complete_text:
                chat_db.save_message(conv_id, "assistant", complete_text, provider="groq", model=target_model)

            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'model': target_model, 'provider': 'groq'})}\n\n"

        except groq.AuthenticationError:
            err_msg = "**Groq Authentication Error (401)**: Invalid Groq API Key. Please verify your `GROQ_API_KEY` in the `.env` file."
            chat_db.save_message(conv_id, "assistant", err_msg, provider="groq", model=target_model)
            yield f"data: {json.dumps({'type': 'token', 'content': err_msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'model': target_model, 'provider': 'groq'})}\n\n"

        except (groq.RateLimitError, groq.NotFoundError, groq.APIStatusError, groq.APIConnectionError) as e:
            status_code = getattr(e, "status_code", None)
            err_str = str(e).lower()
            is_recoverable = (
                isinstance(e, (groq.RateLimitError, groq.NotFoundError, groq.APIConnectionError)) or
                status_code in [404, 408, 413, 429, 500, 502, 503, 504] or
                "rate_limit" in err_str or
                "tpm" in err_str or
                "too large" in err_str or
                "connection" in err_str or
                "timeout" in err_str
            )
            if is_recoverable and target_model != self.fallback_model:
                print(f"[GroqChatService] Streaming recovery from {type(e).__name__} on {target_model}. Retrying with fallback: {self.fallback_model}")
                async for fallback_item in self.stream_chat(
                    user_message=user_message,
                    conversation_id=conv_id,
                    model=self.fallback_model,
                    temperature=temperature,
                    max_tokens=min(max_tokens, 1024),
                    case_dossier=case_dossier,
                    is_retry=True
                ):
                    yield fallback_item
                return

            err_msg = f"**Groq Error ({status_code or 'Status'})**: {str(e)}"
            chat_db.save_message(conv_id, "assistant", err_msg, provider="groq", model=target_model)
            yield f"data: {json.dumps({'type': 'token', 'content': err_msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'model': target_model, 'provider': 'groq'})}\n\n"

        except Exception as e:
            err_str = str(e).lower()
            if target_model != self.fallback_model and (
                "rate_limit" in err_str or 
                "tpm" in err_str or 
                "too large" in err_str or
                "connection" in err_str or 
                "timeout" in err_str
            ):
                print(f"[GroqChatService] Streaming recovery from exception on {target_model}. Retrying with fallback: {self.fallback_model}")
                async for fallback_item in self.stream_chat(
                    user_message=user_message,
                    conversation_id=conv_id,
                    model=self.fallback_model,
                    temperature=temperature,
                    max_tokens=min(max_tokens, 1024),
                    case_dossier=case_dossier,
                    is_retry=True
                ):
                    yield fallback_item
                return

            print(f"[GroqChatService] Streaming Exception: {type(e).__name__} - {str(e)}")
            err_msg = f"**Groq API Error**: {str(e)}"
            if full_response:
                chat_db.save_message(conv_id, "assistant", "".join(full_response), provider="groq", model=target_model)
            yield f"data: {json.dumps({'type': 'token', 'content': f'\\n\\n{err_msg}'})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id, 'model': target_model, 'provider': 'groq'})}\n\n"


# Singleton instance
groq_chat_service = GroqChatService()
