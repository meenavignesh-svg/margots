import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List

import requests
from dotenv import load_dotenv

load_dotenv()


class Role(Enum):
    STRICT = "strict"
    CONTEXT = "context"
    SKEPTIC = "skeptic"


PROMPTS = {
    Role.STRICT: (
        "Stick to what the supplied measurements and sequence features actually support. "
        "Do not speculate. If something is unclear, say so. Prefer short, testable statements."
    ),
    Role.CONTEXT: (
        "Interpret the supplied data in biological context. Mention mechanisms or typical "
        "functions only when appropriate and clearly distinguish interpretation from evidence."
    ),
    Role.SKEPTIC: (
        "Look for alternative explanations and weak points. Identify assumptions and what "
        "additional evidence would change the interpretation."
    ),
}


@dataclass
class Result:
    facts: Dict[str, Any]
    outputs: Dict[str, str]
    errors: Dict[str, str] = field(default_factory=dict)


class Engine:
    """Provider-backed reasoning layer with Ollama Cloud as the preferred online provider.

    If OLLAMA_API_KEY is configured, requests go directly from the MARGOTS backend to
    https://ollama.com/api. Without it, MARGOTS falls back to a local Ollama server.
    """

    def __init__(self):
        self.clients: Dict[Role, Any] = {}
        self.models: Dict[Role, str] = {}
        self._init()

    def _init(self):
        timeout = float(os.getenv("LLM_TIMEOUT_SECONDS", "90"))

        # Online Ollama Cloud. The API key stays server-side in the deployment environment.
        cloud_key = os.getenv("OLLAMA_API_KEY")
        if cloud_key:
            cloud_url = os.getenv("OLLAMA_CLOUD_URL", "https://ollama.com").rstrip("/")
            cloud_model = os.getenv("OLLAMA_CLOUD_MODEL", "gpt-oss:20b")
            for role in Role:
                self.clients[role] = {
                    "type": "ollama-cloud",
                    "url": cloud_url,
                    "key": cloud_key,
                    "timeout": timeout,
                }
                self.models[role] = cloud_model
            return

        # Local Ollama fallback: no API key required.
        if os.getenv("OLLAMA_ENABLED", "1").lower() not in {"0", "false", "no", "off"}:
            local_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
            local_model = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")
            for role in Role:
                self.clients[role] = {"type": "ollama", "url": local_url, "timeout": timeout}
                self.models[role] = local_model
            return

        # Optional cloud fallbacks for deployments that already have these configured.
        key = os.getenv("GEMINI_API_KEY")
        model = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
        if key:
            for role in Role:
                self.clients[role] = {"type": "gemini", "key": key, "timeout": timeout}
                self.models[role] = model
            return

        key = os.getenv("ANTHROPIC_API_KEY")
        model = os.getenv("ANTHROPIC_MODEL") or "claude-sonnet-4-5"
        if key:
            from anthropic import Anthropic
            self.clients[Role.STRICT] = Anthropic(api_key=key, timeout=timeout)
            self.models[Role.STRICT] = model

        key = os.getenv("OPENAI_API_KEY")
        model = os.getenv("OPENAI_MODEL") or "gpt-5.6-luna"
        if key:
            from openai import OpenAI
            self.clients[Role.CONTEXT] = OpenAI(api_key=key, timeout=timeout)
            self.models[Role.CONTEXT] = model

        key = os.getenv("XAI_API_KEY")
        model = os.getenv("XAI_MODEL")
        if key:
            from openai import OpenAI
            self.clients[Role.SKEPTIC] = OpenAI(
                api_key=key, base_url="https://api.x.ai/v1", timeout=timeout
            )
            self.models[Role.SKEPTIC] = model or "grok-4-1-fast-reasoning"

    def available(self) -> List[str]:
        types = {c.get("type") for c in self.clients.values() if isinstance(c, dict)}
        if "ollama-cloud" in types:
            return ["ollama-cloud"]
        if "ollama" in types:
            return ["ollama"]
        if "gemini" in types:
            return ["gemini"]
        return [r.value for r in self.clients]

    def _call_ollama(self, role: Role, user_content: str) -> str:
        cfg = self.clients[role]
        headers = {"Content-Type": "application/json"}
        if cfg.get("type") == "ollama-cloud":
            headers["Authorization"] = f"Bearer {cfg['key']}"

        response = requests.post(
            f"{cfg['url']}/api/chat",
            headers=headers,
            json={
                "model": self.models[role],
                "messages": [
                    {"role": "system", "content": PROMPTS[role]},
                    {"role": "user", "content": user_content},
                ],
                "stream": False,
                "options": {"temperature": 0.2},
            },
            timeout=cfg["timeout"],
        )
        response.raise_for_status()
        data = response.json()
        text = ((data.get("message") or {}).get("content") or "").strip()
        if not text:
            raise RuntimeError("Ollama returned an empty response")
        return text

    def _call_gemini(self, role: Role, user_content: str) -> str:
        cfg = self.clients[role]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.models[role]}:generateContent"
        response = requests.post(
            url,
            params={"key": cfg["key"]},
            json={
                "contents": [{"role": "user", "parts": [{"text": f"{PROMPTS[role]}\n\n{user_content}"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1800},
            },
            timeout=cfg["timeout"],
        )
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates") or []
        parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
        text = "".join(p.get("text", "") for p in parts if isinstance(p, dict)).strip()
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return text

    def _call(self, role: Role, user_content: str) -> str:
        client = self.clients[role]
        if isinstance(client, dict) and client.get("type") in {"ollama", "ollama-cloud"}:
            return self._call_ollama(role, user_content)
        if isinstance(client, dict) and client.get("type") == "gemini":
            return self._call_gemini(role, user_content)

        model = self.models[role]
        system = PROMPTS[role]
        if role == Role.STRICT:
            response = client.messages.create(model=model, max_tokens=1800, temperature=0.2, system=system, messages=[{"role": "user", "content": user_content}])
            text = "".join(getattr(block, "text", "") for block in response.content)
        elif role == Role.CONTEXT:
            response = client.responses.create(model=model, instructions=system, input=user_content, max_output_tokens=1800)
            text = getattr(response, "output_text", "") or ""
        else:
            response = client.chat.completions.create(model=model, temperature=0.3, max_tokens=1800, messages=[{"role": "system", "content": system}, {"role": "user", "content": user_content}])
            text = response.choices[0].message.content or ""
        if not text:
            raise RuntimeError("AI provider returned an empty response")
        return text

    def run(self, payload: str, facts: Dict[str, Any] | None = None) -> Result:
        facts = facts or {}
        outputs: Dict[str, str] = {}
        errors: Dict[str, str] = {}
        user_msg = (
            "You are operating inside MARGOTS, a scientific analysis application.\n\n"
            f"Measured/computed facts:\n{facts}\n\n"
            f"User request:\n{payload}\n\n"
            "Separate measured facts from interpretation. Never invent experiments, citations, "
            "database records, clinical conclusions, or measurements. State uncertainty explicitly."
        )
        if not self.clients:
            errors["backend"] = "No AI provider is configured."
            return Result(facts=facts, outputs=outputs, errors=errors)
        for role in list(self.clients):
            try:
                outputs[role.value] = self._call(role, user_msg)
            except Exception as exc:
                errors[role.value] = self._safe_error(exc)
        return Result(facts=facts, outputs=outputs, errors=errors)

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        message = str(exc).replace("\n", " ").strip()
        for secret_name in ("OLLAMA_API_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY"):
            secret = os.getenv(secret_name)
            if secret:
                message = message.replace(secret, "[redacted]")
        return f"{type(exc).__name__}: {message[:500]}"
