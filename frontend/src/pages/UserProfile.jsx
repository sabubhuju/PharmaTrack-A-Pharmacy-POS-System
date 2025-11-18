import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function UserProfile() {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [alert, setAlert] = useState("");

  const API_URL = "http://localhost/pharmatrack/backend/users.php";

  useEffect(() => {
    document.title = "PharmaTrack";
    const fetchUser = async () => {
      try {
        const res = await axios.get(API_URL, { withCredentials: true });
        if (res.data.success) {
          setUser(res.data.user);
          setName(res.data.user.name);
          setEmail(res.data.user.email);
        } else {
          setAlert(res.data.message);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setAlert("Failed to fetch user info");
      }
    };
    fetchUser();
  }, []);

  const handlePicChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (profilePic) formData.append("profile_pic", profilePic);

      const res = await axios.post(API_URL, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setAlert("Profile updated successfully!");
      } else {
        setAlert(res.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert("Failed to update profile");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">👤 User Profile</h1>

          {alert && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
              {alert}
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="bg-white shadow-lg rounded-lg p-6 max-w-lg"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={user.name || "Your Name"}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user.email || "Your Email"}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Profile Picture</label>
              <input
                type="file"
                onChange={handlePicChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
