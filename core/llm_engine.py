import os
from dataclasses import dataclass, field
from typing import Any, Dict, List
from enum import Enum

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
        "Interpret the data in a biological context. "
        "Mention relevant pathways, typical functions, or known patterns when they fit. "
        "Still flag when you are going beyond the given measurements."
    ),
    Role.SKEPTIC: (
        "Look for alternative explanations and weak points. "
        "What else could produce these numbers? What assumptions are being made? "
        "List things that would change the interpretation if they were true."
    ),
}


@dataclass
class Result:
    facts: Dict[str, Any]
    outputs: Dict[str, str]
    errors: Dict[str, str] = field(default_factory=dict)


class Engine:
    def __init__(self):
        self.clients = {}
        self.models = {}
        self._init()

    def _init(self):
        key = os.getenv("ANTHROPIC_API_KEY")
        if key:
            from anthropic import Anthropic
            self.clients[Role.STRICT] = Anthropic(api_key=key)
            model = os.getenv("ANTHROPIC_MODEL")
            if model:
                self.models[Role.STRICT] = model

        key = os.getenv("OPENAI_API_KEY")
        if key:
            from openai import OpenAI
            self.clients[Role.CONTEXT] = OpenAI(api_key=key)
            model = os.getenv("OPENAI_MODEL")
            if model:
                self.models[Role.CONTEXT] = model

        key = os.getenv("XAI_API_KEY")
        if key:
            from openai import OpenAI
            self.clients[Role.SKEPTIC] = OpenAI(api_key=key, base_url="https://api.x.ai/v1")
            model = os.getenv("XAI_MODEL")
            if model:
                self.models[Role.SKEPTIC] = model

    def available(self) -> List[str]:
        return [r.value for r in self.clients]

    def _call(self, role: Role, user_content: str) -> str:
        client = self.clients[role]
        model = self.models.get(role)
        if not model:
            raise RuntimeError(f"No model configured for {role.value}. Set the corresponding *_MODEL variable.")

        system = PROMPTS[role]

        if role == Role.STRICT:
            resp = client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=0.2,
                system=system,
                messages=[{"role": "user", "content": user_content}],
            )
            return resp.content[0].text

        resp = client.chat.completions.create(
            model=model,
            temperature=0.2 if role != Role.SKEPTIC else 0.5,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_content},
            ],
        )
        return resp.choices[0].message.content or ""

    def run(self, payload: str, facts: Dict[str, Any] | None = None) -> Result:
        facts = facts or {}
        outputs: Dict[str, str] = {}
        errors: Dict[str, str] = {}

        user_msg = (
            f"Measured facts:\n{facts}\n\n"
            f"Request:\n{payload}\n\n"
            f"Respond with clear statements. Separate evidence from interpretation."
        )

        for role in list(self.clients):
            try:
                outputs[role.value] = self._call(role, user_msg)
            except Exception as e:
                errors[role.value] = f"{type(e).__name__}: {e}"

        return Result(facts=facts, outputs=outputs, errors=errors)
