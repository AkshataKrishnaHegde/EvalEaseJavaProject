import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getForms,
  getAllFormSentiments,
  getResponseCounts,
} from "@/services/api";

import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [responseCounts, setResponseCounts] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Handle authentication errors
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("userType");
    localStorage.removeItem("employeeName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("loggedInUser");

    navigate("/login");
  };

  // Fetch sentiment data and response counts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    getAllFormSentiments()
      .then((res) => {
        setSentimentData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch sentiment data", err);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          handleAuthError();
        }
      });

    getResponseCounts()
      .then((res) => {
        setResponseCounts(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch response counts", err);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          handleAuthError();
        }
      });
  }, []);

  // Fetch all forms
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    getForms()
      .then((res) => {
        setForms(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch forms", err);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          handleAuthError();
        }
      });
  }, []);

  // Fetch suggestions for selected form
  useEffect(() => {
    if (!selectedFormId) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch(
      `${import.meta.env.VITE_SERVER_PORT}/api/forms/suggestions/${selectedFormId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleAuthError();
          throw new Error("Unauthorized");
        }

        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }

        return res.json();
      })
      .then((data) => {
        setSuggestions(data);
      })
      .catch((err) => {
        if (err.message !== "Unauthorized") {
          console.error("Failed to fetch suggestions", err);
        }
      });
  }, [selectedFormId]);

  const participationData = responseCounts.map((item) => ({
    form: item.form,
    responses: item.responses,
  }));

  const sentimentCounts = {};

  sentimentData.forEach((form) => {
    const category = form.category;

    sentimentCounts[category] =
      (sentimentCounts[category] || 0) + 1;
  });

  const ratingDistribution = Object.entries(sentimentCounts).map(
    ([category, count]) => ({
      name: category,
      value: count,
      color:
        category === "Very Positive"
          ? "#10b981"
          : category === "Positive"
          ? "#3b82f6"
          : category === "Neutral"
          ? "#f59e0b"
          : "#ef4444",
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>

          <p className="text-gray-600">
            Training feedback insights and performance metrics
          </p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Pie Chart - Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>

            <CardContent>
              {ratingDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">
                  No rating data available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Participation */}
          <Card>
            <CardHeader>
              <CardTitle>Form Participation</CardTitle>
            </CardHeader>

            <CardContent>
              {participationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="form" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="responses"
                      fill="#10b981"
                      name="Responses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">
                  No participation data available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            All Forms
          </h2>

          {forms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-lg font-semibold">
                      Form ID: {form.id}
                    </h2>

                    <p className="text-gray-500">
                      Trainer: {form.trainerName}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/admin/analytics/${form.id}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                  >
                    View Analytics
                  </button>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No forms available.
            </p>
          )}
        </div>

        {/* Form Selector and Suggestions */}
        <Card className="mt-10">
          <CardHeader>

            <CardTitle className="mb-4">
              Trainer Suggestions
            </CardTitle>

            <div className="flex gap-2 items-center">

              <label
                htmlFor="form-select"
                className="text-sm text-gray-600"
              >
                Select Form:
              </label>

              <select
                id="form-select"
                className="border rounded px-2 py-1 text-sm"
                value={selectedFormId || ""}
                onChange={(e) =>
                  setSelectedFormId(
                    Number(e.target.value)
                  )
                }
              >
                <option value="" disabled>
                  Select a form
                </option>

                {forms.map((form) => (
                  <option
                    key={form.id}
                    value={form.id}
                  >
                    {form.title} (ID: {form.id})
                  </option>
                ))}
              </select>

            </div>
          </CardHeader>

          <CardContent>

            {selectedFormId ? (

              suggestions.length > 0 ? (

                <ul className="space-y-4">

                  {suggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      className="bg-white p-4 rounded-xl shadow-sm border"
                    >

                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {sug.question}
                      </h3>

                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Observation:</strong>{" "}
                        {sug.reason}
                      </p>

                      <p className="text-sm text-green-700">
                        <strong>Suggestion:</strong>{" "}
                        {sug.suggestion}
                      </p>

                    </li>
                  ))}

                </ul>

              ) : (

                <p className="text-gray-500 text-sm">
                  No suggestions available for this form.
                </p>

              )

            ) : (

              <p className="text-gray-500 text-sm">
                Please select a form to see suggestions.
              </p>

            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Analytics;