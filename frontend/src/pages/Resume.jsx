import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function Resume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/resume/upload", formData);
      setResult(response.data);
    } catch (err) {
      setError("Could not process this resume. Make sure it's a text-based PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Resume Upload</h1>
          <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
            Back to Dashboard
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-300"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-semibold"
          >
            {uploading ? "Analyzing..." : "Upload & Analyze"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {result && (
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Experience Summary</p>
              <p>{result.experience_summary}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Skills Detected</p>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((skill, i) => (
                  <span key={i} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Suggested Roles</p>
              <div className="flex flex-wrap gap-2">
                {result.suggested_roles.map((role, i) => (
                  <span key={i} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resume;
