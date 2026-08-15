"""
BioOmni AI - Multi-LLM Engine
Supports three frontier models simultaneously for maximum analytical power.
"""

import os
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class BioOmniLLM:
    """Unified interface for OpenAI, Anthropic, and xAI."""

    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.xai_key = os.getenv("XAI_API_KEY")

        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
        self.xai_model = os.getenv("XAI_MODEL", "grok-3")

        self._clients = {}
        self._init_clients()

    def _init_clients(self):
        if self.openai_key:
            try:
                from openai import OpenAI
                self._clients["openai"] = OpenAI(api_key=self.openai_key)
            except Exception as e:
                print(f"OpenAI init failed: {e}")

        if self.anthropic_key:
            try:
                from anthropic import Anthropic
                self._clients["anthropic"] = Anthropic(api_key=self.anthropic_key)
            except Exception as e:
                print(f"Anthropic init failed: {e}")

        if self.xai_key:
            try:
                from openai import OpenAI
                self._clients["xai"] = OpenAI(
                    api_key=self.xai_key,
                    base_url="https://api.x.ai/v1"
                )
            except Exception as e:
                print(f"xAI init failed: {e}")

    def available_providers(self) -> List[str]:
        return list(self._clients.keys())

    def generate(
        self,
        prompt: str,
        provider: str = "auto",
        system: str = None,
        temperature: float = 0.3,
        max_tokens: int = 4096
    ) -> Dict[str, Any]:
        """Generate a response from one or more models."""

        if provider == "auto":
            # Prefer xAI (Grok) > Anthropic > OpenAI if available
            for p in ["xai", "anthropic", "openai"]:
                if p in self._clients:
                    provider = p
                    break
            else:
                return {"error": "No API keys configured. Add at least one key to .env"}

        if provider not in self._clients:
            return {"error": f"Provider '{provider}' not available. Available: {self.available_providers()}"}

        system_prompt = system or (
            "You are BioOmni AI, the world's most capable bioinformatics analysis engine. "
            "You combine deep biological knowledge with rigorous statistical reasoning. "
            "Always be precise, cite methods when relevant, and highlight limitations. "
            "Respond in clear, structured scientific language."
        )

        try:
            if provider == "openai":
                response = self._clients["openai"].chat.completions.create(
                    model=self.openai_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return {
                    "provider": "openai",
                    "model": self.openai_model,
                    "content": response.choices[0].message.content
                }

            elif provider == "anthropic":
                response = self._clients["anthropic"].messages.create(
                    model=self.anthropic_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": prompt}]
                )
                return {
                    "provider": "anthropic",
                    "model": self.anthropic_model,
                    "content": response.content[0].text
                }

            elif provider == "xai":
                response = self._clients["xai"].chat.completions.create(
                    model=self.xai_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return {
                    "provider": "xai",
                    "model": self.xai_model,
                    "content": response.choices[0].message.content
                }

        except Exception as e:
            return {"error": str(e), "provider": provider}

    def consensus(self, prompt: str, system: str = None) -> Dict[str, Any]:
        """Run the same prompt across all available models and return combined view."""
        results = {}
        for provider in self.available_providers():
            results[provider] = self.generate(prompt, provider=provider, system=system)
        return results