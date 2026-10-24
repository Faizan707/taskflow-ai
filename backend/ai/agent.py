"""
Build and run the TaskFlow AI agent (Ollama + LangChain).

Beginner flow:
1. ChatOllama  -> talks to your local Ollama model (qwen3:4b)
2. tools       -> Python functions the model can call
3. create_agent -> loops: think -> maybe call tool -> answer
"""

import os
from typing import Any

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_ollama import ChatOllama
from sqlalchemy.orm import Session

from ai.tools import make_tools
from models import User

load_dotenv()

# Change these in .env if needed
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:4b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

SYSTEM_PROMPT = """
You are TaskFlow AI — a helpful assistant for a project / kanban app.

You can use tools to:
- count or list projects
- create a project
- count tasks
- create a task (and assign someone)
- assign an existing task
- list people (for assignment)

Rules:
- Prefer using tools instead of guessing database facts.
- Keep answers short and clear.
- If something is missing (project name, person), ask one short question.
- After creating or assigning, confirm what you did.
""".strip()


def _text_from_message(message: Any) -> str:
    """
    Get plain text from the AI reply.

    Sometimes reply is already a string.
    Sometimes it is a list of pieces. We join those pieces into one string.
    """
    # AIMessage object? take .content. Otherwise use the value itself.
    if hasattr(message, "content"):
        content = message.content
    else:
        content = message

    # Case 1: normal text
    if type(content) is str:
        return content.strip()

    # Case 2: list of pieces -> join into one string
    if type(content) is list:
        text = ""
        for piece in content:
            if type(piece) is str:
                text = text + piece
            elif type(piece) is dict:
                # example: {"type": "text", "text": "hello"}
                text = text + str(piece.get("text", ""))
        return text.strip()

    # Case 3: anything else -> force to string
    return str(content).strip()


def run_assistant(message: str, db: Session, current_user: User) -> str:
    """
    Send one user message to the agent and return the final text reply.
    """
    # 1) Local LLM via Ollama
    llm = ChatOllama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=0.2,
    )

    # 2) Tools that can read/write THIS user's data
    tools = make_tools(db, current_user)

    # 3) Agent = LLM + tools loop
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
    )

    # 4) Run one turn
    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": message,
                }
            ]
        }
    )

    messages = result.get("messages", [])
    if not messages:
        return "Sorry, I could not generate a reply."

    # Last message is usually the final AI answer
    return _text_from_message(messages[-1]) or "Done."
