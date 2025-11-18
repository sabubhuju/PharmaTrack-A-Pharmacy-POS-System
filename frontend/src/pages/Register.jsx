import { useState } from "react";
import { Mail, Lock, User, Pill } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pharmacist"); 
  const [passwordStrength, setPasswordStrength] = useState("");

  const checkPasswordStrength = (pwd) => {
    let score = 0;

    const lengthCheck = pwd.length >= 8;
    const extraLength = pwd.length >= 14;
    const upper = /[A-Z]/.test(pwd);
    const lower = /[a-z]/.test(pwd);
    const number = /[0-9]/.test(pwd);
    const special = /[^A-Za-z0-9]/.test(pwd);

    if (lengthCheck) score++;
    if (extraLength) score++; 
    if (upper) score++;
    if (lower) score++;
    if (number) score++;
    if (special) score++;

    // Categorize
    if (score < 3) return "Very Weak";
    if (score === 3) return "Weak";
    if (score === 4) return "Medium";
    if (score === 5) return "Strong";
    if (score === 6) return "Very Strong";

    return "";
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Prevent submission for weak passwords
    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      alert("Password is too weak. Please choose a stronger password.");
      return;
    }

    try {
      const res = await fetch("http://localhost/pharmatrack/backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registered successfully!");
        navigate("/"); // go to login page
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-blue-600 text-white p-3 rounded-full">
            <Pill size={28} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">PharmaTrack</h1>
        <p className="text-sm text-gray-500 mb-6">Create your account</p>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="••••••"
              className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-600"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {password && (
              <p
                className={`text-sm mt-1 ${
                  passwordStrength === "Very Weak" || passwordStrength === "Weak"
                    ? "text-red-600"
                    : passwordStrength === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                Strength: {passwordStrength}
              </p>
            )}
          </div>

          <div className="relative">
            <select
              className="w-full p-2 border rounded-lg focus:outline-blue-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Sign Up
          </button>
        </form>

        <p className="text-sm mt-4 text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
