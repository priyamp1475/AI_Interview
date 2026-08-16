import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function SqlQuiz() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState(null);
  const [userQuery, setUserQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await apiClient.post("/sql/generate", { topic, difficulty: "easy" });
      setQuestion(response.data);
      setUserQuery("");
    } catch (err) {
      setError("Could not generate a question. Try a different topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/sql/run", {
        schema_sql: question.schema_sql,
        seed_sql: question.seed_sql,
        solution_query: question.solution_query,
        user_query: userQuery,
      });
      setResult(response.data);
    } catch (err) {
      setError("Could not run your query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">SQL Quiz</h1>
          <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
            Back to Dashboard
          </button>
        </div>

        {!question && (
          <form onSubmit={handleGenerate} className="bg-gray-800 p-6 rounded-lg space-y-4">
            <input
              type="text"
              placeholder="Topic (e.g. employees and departments)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 outline-none"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold">
              {loading ? "Generating..." : "Generate Question"}
            </button>
          </form>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {question && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg space-y-3">
              <p className="text-lg">{question.question}</p>
              <div>
                <p className="text-gray-400 text-sm mb-1">Schema</p>
                <pre className="app-bg p-3 rounded text-sm overflow-x-auto">{question.schema_sql}</pre>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Sample Data</p>
                <pre className="app-bg p-3 rounded text-sm overflow-x-auto">{question.seed_sql}</pre>
              </div>
            </div>

            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Write your SQL query here..."
              className="w-full p-3 rounded bg-gray-800 outline-none h-32 font-mono text-sm resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={loading || !userQuery.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
              >
                {loading ? "Running..." : "Run Query"}
              </button>
              <button
                onClick={() => {
                  setQuestion(null);
                  setResult(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded font-semibold"
              >
                New Question
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${result.correct ? "bg-green-900" : "bg-red-900"}`}>
                <p className="font-bold mb-2">{result.correct ? "✅ Correct!" : "❌ Not quite"}</p>
                {result.error && <p className="text-red-300 text-sm mb-2">Error: {result.error}</p>}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Your Result</p>
                    <pre className="app-bg p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.actual_rows, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Expected Result</p>
                    <pre className="app-bg p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.expected_rows, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SqlQuiz;
