import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";

function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get(`/interview/sessions/${id}`)
      .then((res) => setSession(res.data))
      .catch(() => setError("Could not load this session."));
  }, [id]);

  return (
    <div className="min-h-screen app-bg text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pb-8 space-y-4">
        {error && <p className="text-red-400">{error}</p>}
        {!session && !error && <p>Loading...</p>}

        {session && (
          <>
            <div>
              <h1 className="text-2xl font-bold">{session.role}</h1>
              <p className="text-gray-300">{session.topic}</p>
              <p className="text-gray-400 text-sm">
                {new Date(session.date).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              {session.questions.map((qa, i) => (
                <div key={i} className="bg-black/20 backdrop-blur-sm p-5 rounded-lg space-y-2">
                  <p className="font-semibold">
                    Q{i + 1}: {qa.question}
                  </p>
                  {qa.answer ? (
                    <>
                      <p className="text-gray-300 text-sm">
                        <span className="text-gray-400">Your answer: </span>
                        {qa.answer}
                      </p>
                      <p className="text-blue-300 font-bold">
                        Score: {qa.score}/10
                      </p>
                      <p className="text-gray-300 text-sm">{qa.feedback}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Not answered</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SessionDetail;
