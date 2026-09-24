import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  FileText,
  LogOut,
} from "lucide-react";

const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [pendingForms, setPendingForms] = useState([]);
  const [completedForms, setCompletedForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [errorForms, setErrorForms] = useState(null);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userType");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  // Fetch employee forms
  const fetchEmployeeForms = useCallback(async () => {
    setLoadingForms(true);
    setErrorForms(null);

    const employeeId = localStorage.getItem("employeeId");
    const token = localStorage.getItem("token");

    // Check employee ID
    if (!employeeId) {
      setErrorForms("Employee ID not found. Please log in.");
      setLoadingForms(false);
      return;
    }

    // Check JWT token
    if (!token) {
      setErrorForms(
        "Authentication token not found. Please log in again."
      );
      setLoadingForms(false);
      return;
    }

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_PORT
        }/api/employee-dashboard/forms/${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle unauthorized/forbidden requests
      if (res.status === 401 || res.status === 403) {
        console.error(
          `Authentication failed. HTTP status: ${res.status}`
        );

        // Token may be expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("userType");
        localStorage.removeItem("employeeName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("loggedInUser");

        setErrorForms(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);

        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Check backend response
      if (!data.success || !data.data) {
        setErrorForms(
          data.error || "Unexpected response format"
        );
        return;
      }

      const {
        pendingForms = [],
        completedForms = [],
      } = data.data || {};

      setPendingForms(pendingForms);
      setCompletedForms(completedForms);

    } catch (err) {
      console.error(
        "Failed to fetch employee forms",
        err
      );

      setErrorForms(
        "Failed to load feedback forms. Please try again."
      );
    } finally {
      setLoadingForms(false);
    }
  }, [navigate]);

  // Fetch forms when dashboard loads
  useEffect(() => {
    fetchEmployeeForms();
  }, [fetchEmployeeForms]);

  // Format date
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";

    const date = new Date(dateTimeString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Dashboard
              </h1>

              <p className="text-gray-600">
                Welcome back, {user?.name || "Employee"}
              </p>
            </div>

            <div className="flex space-x-4">

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>

            </div>

          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Pending Feedback Forms */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">

          <div className="p-6 border-b">

            <h2 className="text-xl font-semibold text-gray-900">
              Pending Feedback Forms
            </h2>

            <p className="text-gray-600">
              Please provide feedback for available forms
            </p>

          </div>

          <div className="p-6">

            {loadingForms ? (
              <p className="text-center text-gray-500">
                Loading forms...
              </p>

            ) : errorForms ? (
              <p className="text-center text-red-500">
                {errorForms}
              </p>

            ) : pendingForms.length > 0 ? (

              <div className="space-y-4">

                {pendingForms.map((form) => (

                  <Link
                    key={form.id}
                    to={`/employee/feedback/${form.id}`}
                    className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition duration-200"
                  >

                    <div className="flex items-center space-x-4">

                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>

                        <h3 className="font-medium text-gray-900">
                          {form.title}
                        </h3>

                        <p className="text-sm text-gray-600">
                          {form.description ||
                            "No description available."}
                        </p>

                      </div>

                    </div>

                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                      Submit Feedback
                    </span>

                  </Link>

                ))}

              </div>

            ) : (

              <p className="text-center text-gray-500">
                No pending feedback forms.
              </p>

            )}

          </div>

        </div>

        {/* Completed Feedback Forms */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">

          <div className="p-6 border-b">

            <h2 className="text-xl font-semibold text-gray-900">
              Completed Feedback Forms
            </h2>

            <p className="text-gray-600">
              View forms you have already submitted
            </p>

          </div>

          <div className="p-6">

            {loadingForms ? (

              <p className="text-center text-gray-500">
                Loading forms...
              </p>

            ) : errorForms ? (

              <p className="text-center text-red-500">
                {errorForms}
              </p>

            ) : completedForms.length > 0 ? (

              <div className="space-y-4">

                {completedForms.map((form) => (

                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50"
                  >

                    <div className="flex items-center space-x-4">

                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div>

                        <h3 className="font-medium text-gray-900">
                          {form.title}
                        </h3>

                        <p className="text-sm text-gray-600">

                          {form.description ||
                            "No description available."}

                          {form.submittedAt &&
                            ` (Submitted: ${formatDate(
                              form.submittedAt
                            )})`}

                        </p>

                      </div>

                    </div>

                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      Feedback Submitted
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <p className="text-center text-gray-500">
                No completed feedback forms.
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;