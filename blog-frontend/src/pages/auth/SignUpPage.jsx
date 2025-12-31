import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Profiler } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    profileImage: "",
    username: "",
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          form.append(key, formData[key]);
        }
      });

      const data = await register(form);
      setLoading(false);
      navigate("/profile");
    } catch (error) {
      setLoading(false);
      setError(error.message || "Failed to sign up");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-lg p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {/* First & Last Name */}
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          {/* Profile Photo (optional) */}
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={(e) =>
              setFormData({
                ...formData,
                profileImage: e.target.files[0], // ✅ store FILE object
              })
            }
            className="w-full p-2 border rounded text-sm"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
