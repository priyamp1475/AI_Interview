import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function Interview() {
  const navigate = useNavigate();

  const [step, setStep] = useState("setup");
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await apiClient.post("/interview/start", { role, topic });
      setSession(response.data);
      setStep("interview");
      setCurrentIndex(0);
      setResults([]);
      speakQuestion(response.data.questions[0].question_text);
    } catch (err) {
      setError("Could not start interview. Please try again.");
    }
  };

  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Please use Chrome or Edge, or type your answer instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswerText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setIsSubmitting(true);
    setError("");

    const currentQuestion = session.questions[currentIndex];

    try {
      const response = await apiClient.post("/interview/answer", {
        question_id: currentQuestion.id,
        answer_text: answerText,
      });

      setResults((prev) => [
        ...prev,
        {
          question: currentQuestion.question_text,
          answer: answerText,
          score: response.data.score,
          feedback: response.data.feedback,
        },
      ]);

      setAnswerText("");

      const nextIndex = currentIndex + 1;
      if (nextIndex < session.questions.length) {
        setCurrentIndex(nextIndex);
        speakQuestion(session.questions[nextIndex].question_text);
      } else {
        setStep("done");
      }
    } catch (err) {
      setError("Could not submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "setup") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <form onSubmit={handleStart} className="bg-gray-800 p-8 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-center">Start Mock Interview</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <input
            type="text"
            placeholder="Target role (e.g. Backend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Topics (e.g. Python, REST APIs)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 outline-none"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-semibold">
            Start Interview
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full text-gray-400 text-sm hover:text-white"
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (step === "interview") {
    const currentQuestion = session.questions[currentIndex];
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-6">
          <p className="text-gray-400">
            Question {currentIndex + 1} of {session.questions.length}
          </p>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-lg">{currentQuestion.question_text}</p>
            <button
              onClick={() => speakQuestion(currentQuestion.question_text)}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              🔊 Replay question
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Your answer will appear here as you speak, or type directly..."
            className="w-full p-3 rounded bg-gray-700 outline-none h-32 resize-none"
          />

          <div className="flex gap-3">
            {!isListening ? (
              <button
                onClick={startListening}
                className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded font-semibold"
              >
                🎤 Speak Answer
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex-1 bg-red-600 hover:bg-red-700 p-3 rounded font-semibold animate-pulse"
              >
                ⏹ Stop Listening
              </button>
            )}
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answerText.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Interview Complete</h2>
        {results.map((r, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-lg space-y-2">
            <p className="font-semibold">{r.question}</p>
            <p className="text-gray-400 text-sm">Your answer: {r.answer}</p>
            <p className="text-blue-400 font-bold">Score: {r.score}/10</p>
            <p className="text-gray-300 text-sm">{r.feedback}</p>
          </div>
        ))}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Interview;
