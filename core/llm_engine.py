import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List

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
    """Real provider-backed reasoning layer.

    Deterministic bioinformatics produces measurements; this class sends those measurements
    to configured trained foundation models for interpretation. No hardcoded AI answer is used.
    """

    def __init__(self):
        self.clients: Dict[Role, Any] = {}
        self.models: Dict[Role, str] = {}
        self._init()

    def _init(self):
        timeout = float(os.getenv("LLM_TIMEOUT_SECONDS", "45"))

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
                api_key=key,
                base_url="https://api.x.ai/v1",
                timeout=timeout,
            )
            self.models[Role.SKEPTIC] = model or "grok-4-1-fast-reasoning"

    def available(self) -> List[str]:
        return [r.value for r in self.clients]

    def _call(self, role: Role, user_content: str) -> str:
        client = self.clients[role]
        model = self.models[role]
        system = PROMPTS[role]

        if role == Role.STRICT:
            response = client.messages.create(
                model=model,
                max_tokens=1800,
                temperature=0.2,
                system=system,
                messages=[{"role": "user", "content": user_content}],
            )
            text = "".join(getattr(block, "text", "") for block in response.content)
        elif role == Role.CONTEXT:
            # OpenAI's current SDK supports the Responses API for current models.
            response = client.responses.create(
                model=model,
                instructions=system,
                input=user_content,
                max_output_tokens=1800,
            )
            text = getattr(response, "output_text", "") or ""
        else:
            response = client.chat.completions.create(
                model=model,
                temperature=0.3,
                max_tokens=1800,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_content},
                ],
            )
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
            errors["backend"] = "No server-side AI provider is configured."
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
        for secret_name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY"):
            secret = os.getenv(secret_name)
            if secret:
                message = message.replace(secret, "[redacted]")
        return f"{type(exc).__name__}: {message[:500]}"
