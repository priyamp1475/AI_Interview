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

def generate_coding_problem(topic: str, difficulty: str = "easy"):
    prompt = f"""You are creating a coding practice problem for topic: "{topic}", difficulty: {difficulty}.

The problem must be solvable by a program that reads input from stdin and prints output to stdout (like a competitive programming problem).

Return ONLY valid JSON in this exact structure, nothing else:
{{
  "title": "short title",
  "description": "clear problem description including input/output format",
  "starter_code": "# Write your Python solution here\\n",
  "test_cases": [
    {{"input": "example stdin input", "expected_output": "expected stdout output"}},
    {{"input": "another input", "expected_output": "another expected output"}},
    {{"input": "a third input", "expected_output": "a third expected output"}}
  ]
}}
"""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    content = _clean_json_response(response.text)

    problem = json.loads(content)
    return problem


def generate_sql_question(topic: str, difficulty: str = "easy"):
    prompt = f"""You are creating a SQL practice question for topic: "{topic}", difficulty: {difficulty}.

Design a small database schema (1-3 tables) with realistic sample data, then write a question that requires a SELECT query to answer.

Return ONLY valid JSON in this exact structure, nothing else:
{{
  "question": "plain English question the candidate must answer with a SQL query",
  "schema_sql": "one or more CREATE TABLE statements, separated by semicolons",
  "seed_sql": "one or more INSERT statements to populate the tables, separated by semicolons",
  "solution_query": "the correct SELECT query that answers the question"
}}

Keep schema_sql and seed_sql valid standard SQLite syntax. Use simple, realistic sample data (5-10 rows total).
"""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    content = _clean_json_response(response.text)

    question = json.loads(content)
    return question


def extract_skills_from_resume(resume_text: str):
    prompt = f"""You are analyzing a candidate's resume text to extract key information.

Resume text:
{resume_text[:6000]}

Return ONLY valid JSON in this exact structure, nothing else:
{{
  "skills": ["skill1", "skill2", "skill3"],
  "experience_summary": "1-2 sentence summary of their experience level and background",
  "suggested_roles": ["role1", "role2"]
}}
"""

    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    content = _clean_json_response(response.text)

    result = json.loads(content)
    return result
