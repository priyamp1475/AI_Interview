import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <p className="text-gray-400">Your interview modules will appear here in the next phases.</p>
    </div>
  );
}

export default Dashboard;