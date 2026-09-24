import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FeedbackFormViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [hoveredRating, setHoveredRating] = useState({});

  // Load feedback form
  useEffect(() => {
    const fetchForm = async () => {
      const token = localStorage.getItem("token");

      // User is not logged in
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_PORT}/api/forms/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // JWT is missing/expired/invalid
        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Failed to load form", err);
      }
    };

    fetchForm();
  }, [id, navigate]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const employeeId = localStorage.getItem("employeeId");

    // User is not logged in
    if (!token) {
      navigate("/login");
      return;
    }

    if (!employeeId) {
      toast.error("Employee information not found. Please login again.");
      navigate("/login");
      return;
    }

    const payload = {
      formId: id,
      responses: answers,
      submittedAt: new Date().toISOString(),
      employeeId: employeeId,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_PORT}/api/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      // JWT is missing/expired/invalid
      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to submit. HTTP status: ${res.status}`);
      }

      toast.success("Form submitted successfully! 🎉");
      navigate("/employee/dashboard");
    } catch (err) {
      alert("Failed to submit response");
      console.error(err);
    }
  };

  // Loading state
  if (!form) {
    return <div className="p-6">Loading form...</div>;
  }

  // No questions
  if (!Array.isArray(form.questions) || form.questions.length === 0) {
    return (
      <div className="p-6">
        No questions found in this form.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-lg rounded-lg border">

          <h1 className="text-3xl font-semibold mb-4">
            {form.title}
          </h1>

          {form.description && (
            <p className="mb-8 text-gray-600 text-base">
              {form.description}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {form.questions.map((q, i) => {
              const isRequired = Boolean(q.required);

              return (
                <div
                  key={q.id || i}
                  className="bg-gray-50 border rounded-md p-4 space-y-2"
                >

                  <label className="block text-gray-800 font-medium text-base">
                    {i + 1}. {q.title}

                    {isRequired && (
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    )}
                  </label>

                  {/* Text */}
                  {q.type === "text" && (
                    <input
                      type="text"
                      required={isRequired}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) =>
                        handleChange(q.id, e.target.value)
                      }
                    />
                  )}

                  {/* Textarea */}
                  {q.type === "textarea" && (
                    <textarea
                      required={isRequired}
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      onChange={(e) =>
                        handleChange(q.id, e.target.value)
                      }
                    />
                  )}

                  {/* Rating */}
                  {q.type === "rating" && q.ratingScale && (
                    <div className="flex space-x-1">
                      {[...Array(q.ratingScale)].map((_, idx) => {
                        const value = idx + 1;

                        const selectedValue =
                          answers[q.id] || 0;

                        const isHovered =
                          hoveredRating[q.id] != null;

                        const shouldFill = isHovered
                          ? hoveredRating[q.id] >= value
                          : selectedValue >= value;

                        return (
                          <label
                            key={idx}
                            className="cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`rating-${q.id}`}
                              value={value}
                              className="hidden"
                              required={isRequired}
                              onChange={() =>
                                handleChange(q.id, value)
                              }
                              onMouseEnter={() =>
                                setHoveredRating((prev) => ({
                                  ...prev,
                                  [q.id]: value,
                                }))
                              }
                              onMouseLeave={() =>
                                setHoveredRating((prev) => ({
                                  ...prev,
                                  [q.id]: null,
                                }))
                              }
                            />

                            <span
                              className="text-2xl transition-all duration-150 hover:text-yellow-400"
                              style={{
                                color: shouldFill
                                  ? "#FACC15"
                                  : "#9CA3AF",
                              }}
                            >
                              ★
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple choice */}
                  {q.type === "multiple" &&
                    Array.isArray(q.options) && (
                      <div className="space-y-1">
                        {q.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              name={`multi-${q.id}`}
                              value={opt}
                              required={isRequired}
                              onChange={() =>
                                handleChange(q.id, opt)
                              }
                            />

                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                  {/* Checkbox */}
                  {q.type === "checkbox" &&
                    Array.isArray(q.options) && (
                      <div className="space-y-1">
                        {q.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const prev =
                                  answers[q.id] || [];

                                const updated =
                                  e.target.checked
                                    ? [...prev, opt]
                                    : prev.filter(
                                        (o) => o !== opt
                                      );

                                handleChange(
                                  q.id,
                                  updated
                                );
                              }}
                            />

                            <span>{opt}</span>
                          </label>
                        ))}

                        {isRequired && (
                          <p className="text-sm text-gray-500 mt-1">
                            Select at least one option *
                          </p>
                        )}
                      </div>
                    )}

                </div>
              );
            })}

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow-sm"
            >
              Submit Feedback
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFormViewer;