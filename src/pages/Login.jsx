import { useState } from "react";
import logo from "../assets/rc.png";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();
  if(user){
    navigate("/")
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login", // Adjust endpoint if needed
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.status) {
        toast.success("Login successful!");
        login(data.data); // or whatever structure your API returns
        navigate("/"); // adjust route
      } else {
        toast.error(data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff] px-2">
      <div className="bg-white rounded-2xl px-6 py-5 w-full max-w-sm space-y-5 border border-gray-300">
        <div className="flex items-center gap-3 justify-center mb-1">
          <img src={logo} alt="RapidShare" className="h-14" />
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-700">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7763D]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7763D]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center w-full bg-[#D7763D] text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            {isSubmitting ? (
              <ScaleLoader
                color="#ffffff"
                height={10}
                width={3}
                radius={2}
                margin={2}
              />
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
