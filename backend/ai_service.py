import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-3.1-flash-lite"


def _clean_json_response(text: str) -> str:
    text = text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return text


def generate_questions(role: str, topic: str, num_questions: int = 5):
    prompt = f"""You are an expert technical interviewer.
Generate {num_questions} interview questions for a candidate applying for the role: "{role}",
focused on the topic(s): "{topic}".

Return ONLY a valid JSON array of strings, nothing else. Example format:
["Question 1 text", "Question 2 text", "Question 3 text"]
"""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    content = _clean_json_response(response.text)

    questions = json.loads(content)
    return questions


def evaluate_answer(question: str, answer: str):
    prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

Question: {question}
Candidate's answer: {answer}

Evaluate the answer and return ONLY valid JSON in this exact format, nothing else:
{{"score": <number from 0 to 10>, "feedback": "<2-3 sentences of constructive feedback>"}}
"""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    content = _clean_json_response(response.text)

    result = json.loads(content)
    return result