import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from '../../hooks/useAuth'

export default function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await login({ username, password }); 
      console.log(data.data);
    } catch (error) {
      setError("Username or password is incorrect");
      setLoading(false);
      console.log(error);
      return;
    }

    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        { error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        ) }

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 border rounded"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded"
        />

        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800" onClick={() => handleSubmit()}>
          { loading ? "Logging in..." : "Login" }
        </button>

        <p className="text-center text-sm mt-4">
          Don’t have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
