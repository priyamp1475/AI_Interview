import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex justify-between items-center mb-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="text-lg font-bold text-white hover:text-blue-300"
      >
        AI Interview Prep
      </button>
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`text-sm ${
              location.pathname === link.path
                ? "text-white font-semibold"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
