import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";

function CodingRound() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await apiClient.post("/coding/generate", { topic, difficulty: "easy" });
      setProblem(response.data);
      setCode(response.data.starter_code || "");
    } catch (err) {
      setError("Could not generate a problem. Try a different topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/coding/run", {
        code,
        language: "python",
        test_cases: problem.test_cases,
      });
      setResult(response.data);
    } catch (err) {
      setError("Could not run your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pb-8 space-y-6">
        <h1 className="text-2xl font-bold">Coding Round</h1>

        {!problem && (
          <form onSubmit={handleGenerate} className="bg-gray-800 p-6 rounded-lg space-y-4">
            <input
              type="text"
              placeholder="Topic (e.g. arrays and loops)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 outline-none"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold">
              {loading ? "Generating..." : "Generate Problem"}
            </button>
          </form>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {problem && (
          <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-2">{problem.title}</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              className="w-full p-3 rounded bg-gray-800 outline-none h-64 font-mono text-sm resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={loading || !code.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
              >
                {loading ? "Running..." : "Run Code"}
              </button>
              <button
                onClick={() => {
                  setProblem(null);
                  setResult(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded font-semibold"
              >
                New Problem
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${result.all_passed ? "bg-green-900" : "bg-red-900"}`}>
                <p className="font-bold mb-3">
                  {result.all_passed ? "✅ All test cases passed!" : "❌ Some test cases failed"}
                </p>
                <div className="space-y-2">
                  {result.results.map((r, i) => (
                    <div key={i} className="app-bg p-3 rounded text-sm">
                      <p className={r.passed ? "text-green-400" : "text-red-400"}>
                        Test {i + 1}: {r.passed ? "Passed" : "Failed"}
                      </p>
                      {!r.passed && (
                        <div className="text-gray-400 mt-1">
                          <p>Input: {r.input}</p>
                          <p>Expected: {r.expected_output}</p>
                          <p>Got: {r.actual_output || "(no output)"}</p>
                          {r.error && <p className="text-red-300">Error: {r.error}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodingRound;
