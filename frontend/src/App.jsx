import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Analytics from "./pages/Analytics";
import Resume from "./pages/Resume";
import SqlQuiz from "./pages/SqlQuiz";
import CodingRound from "./pages/CodingRound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/sql-quiz" element={<SqlQuiz />} />
        <Route path="/coding-round" element={<CodingRound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
