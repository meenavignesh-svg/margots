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
        "Stick to what the numbers and sequence features actually support. "
        "Do not speculate. If something is unclear, say so. "
        "Prefer short, testable statements over narrative."
    ),
    Role.CONTEXT: (
        "Interpret the data in a biological context. Mention relevant pathways, "
        "typical functions, or known patterns when they fit. Still flag when you "
        "are going beyond the given measurements."
    ),
    Role.SKEPTIC: (
        "Look for alternative explanations and weak points. What else could produce "
        "these numbers? What assumptions are being made? List things that would change "
        "the interpretation if they were true."
    ),
}


@dataclass
class Result:
    facts: Dict[str, Any]
    outputs: Dict[str, str]
    errors: Dict[str, str] = field(default_factory=dict)


class Engine:
    def __init__(self):
        self.clients: Dict[Role, Any] = {}
        self.models: Dict[Role, str] = {}
        self._init()

    def _init(self):
        key = os.getenv("ANTHROPIC_API_KEY")
        model = os.getenv("ANTHROPIC_MODEL")
        if key and model:
            from anthropic import Anthropic
            self.clients[Role.STRICT] = Anthropic(api_key=key, timeout=float(os.getenv("LLM_TIMEOUT_SECONDS", "30")))
            self.models[Role.STRICT] = model

        key = os.getenv("OPENAI_API_KEY")
        model = os.getenv("OPENAI_MODEL")
        if key and model:
            from openai import OpenAI
            self.clients[Role.CONTEXT] = OpenAI(api_key=key, timeout=float(os.getenv("LLM_TIMEOUT_SECONDS", "30")))
            self.models[Role.CONTEXT] = model

        key = os.getenv("XAI_API_KEY")
        model = os.getenv("XAI_MODEL")
        if key and model:
            from openai import OpenAI
            self.clients[Role.SKEPTIC] = OpenAI(
                api_key=key,
                base_url="https://api.x.ai/v1",
                timeout=float(os.getenv("LLM_TIMEOUT_SECONDS", "30")),
            )
            self.models[Role.SKEPTIC] = model

    def available(self) -> List[str]:
        return [r.value for r in self.clients]

    def _call(self, role: Role, user_content: str) -> str:
        client = self.clients[role]
        model = self.models[role]
        system = PROMPTS[role]

        if role == Role.STRICT:
            resp = client.messages.create(
                model=model,
                max_tokens=2048,
                temperature=0.2,
                system=system,
                messages=[{"role": "user", "content": user_content}],
            )
            text = "".join(getattr(block, "text", "") for block in resp.content)
            if not text:
                raise RuntimeError("Provider returned an empty response")
            return text

        resp = client.chat.completions.create(
            model=model,
            temperature=0.2 if role != Role.SKEPTIC else 0.5,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
        )
        text = resp.choices[0].message.content or ""
        if not text:
            raise RuntimeError("Provider returned an empty response")
        return text

    def run(self, payload: str, facts: Dict[str, Any] | None = None) -> Result:
        facts = facts or {}
        outputs: Dict[str, str] = {}
        errors: Dict[str, str] = {}
        user_msg = (
            f"Measured facts:\n{facts}\n\nRequest:\n{payload}\n\n"
            "Respond with clear statements. Separate evidence from interpretation."
        )

        for role in list(self.clients):
            try:
                outputs[role.value] = self._call(role, user_msg)
            except Exception as exc:
                errors[role.value] = self._safe_error(exc)
        return Result(facts=facts, outputs=outputs, errors=errors)

    @staticmethod
    def _safe_error(exc: Exception) -> str:
        # Return a useful class/message without credentials or provider response bodies.
        message = str(exc).replace("\n", " ").strip()
        for secret_name in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "XAI_API_KEY"):
            secret = os.getenv(secret_name)
            if secret:
                message = message.replace(secret, "[redacted]")
        return f"{type(exc).__name__}: {message[:500]}"
