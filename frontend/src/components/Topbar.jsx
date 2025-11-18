import { LogOut, Pill } from "lucide-react";

export default function Topbar() {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div className="fixed top-1 left-6 w-56 bg-white rounded-xl p-4 flex items-center gap-3 z-20">
        <div className="bg-blue-600 text-white p-2 rounded-lg">
          <Pill size={20} />
        </div>
        <h1 className="text-xl font-semibold">PharmaTrack</h1>
      </div>

      <header className="flex justify-end bg-gray-50 px-6 py-4 shadow-sm">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>
    </>
  );
}
