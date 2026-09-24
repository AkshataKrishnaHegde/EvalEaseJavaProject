import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, LogIn, XCircle, Mail } from "lucide-react";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const navigate = useNavigate();

  // Show success/error message
  const showMessage = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_PORT}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      // Login failed
      if (!res.ok) {
        const errorText = await res.text();

        let errorMessage = "Invalid email or password.";

        try {
          const errorData = JSON.parse(errorText);

          errorMessage =
            errorData.message ||
            errorData ||
            errorText ||
            "Invalid email or password.";
        } catch {
          errorMessage =
            errorText ||
            "Invalid email or password.";
        }

        showMessage("error", errorMessage);
        return;
      }

      // Login successful
      const authResponse = await res.json();

      console.log("Login successful:", authResponse);

      /*
       * Backend response:
       *
       * {
       *   token,
       *   id,
       *   name,
       *   email,
       *   role
       * }
       */

      // Store JWT token
      localStorage.setItem("token", authResponse.token);

      // Store user information
      localStorage.setItem("employeeId", authResponse.id);
      localStorage.setItem("employeeName", authResponse.name);
      localStorage.setItem("userEmail", authResponse.email);
      localStorage.setItem("userType", authResponse.role);

      // Store complete logged-in user
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          id: authResponse.id,
          name: authResponse.name,
          email: authResponse.email,
          role: authResponse.role,
        })
      );

      // Update React state
      setUser({
        id: authResponse.id,
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role,
      });

      // Navigate based on role returned by backend
      if (authResponse.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }

      showMessage("success", "Login successful!");

    } catch (error) {
      console.error("Login error:", error);

      showMessage(
        "error",
        "Login failed. Please check your connection and try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            EvalEase
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Success / Error Message */}
        {message.text && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <p className="text-sm font-medium">
              {message.text}
            </p>

            <button
              type="button"
              onClick={() => setMessage({ type: "", text: "" })}
              className="ml-4"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="Enter your password"
                />
              </div>
            </div>

          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Sign In
          </button>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium transition duration-150 ease-in-out"
              >
                Sign up
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
