import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_SERVER_PORT}/api/analytics`;

// Get JWT token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Get all forms
export const getForms = () =>
  axios.get(`${BASE_URL}/forms`, {
    headers: getAuthHeaders(),
  });

// Get questions for a form
export const getQuestions = (formId: number | string) =>
  axios.get(`${BASE_URL}/forms/${formId}/questions`, {
    headers: getAuthHeaders(),
  });

// Get session analytics
export const getSessionAnalytics = (formId: number | string) =>
  axios.get(`${BASE_URL}/forms/${formId}/session-analytics`, {
    headers: getAuthHeaders(),
  });

// Get average sentiment for a form
export const getAverageSentiment = (formId: number | string) =>
  axios.get(`${BASE_URL}/forms/${formId}/sentiment/average`, {
    headers: getAuthHeaders(),
  });

// Get response count for a form
export const getResponseCount = (formId: number | string) =>
  axios.get(`${BASE_URL}/forms/${formId}/responses/count`, {
    headers: getAuthHeaders(),
  });

// Get sentiment for all forms
export const getAllFormSentiments = () =>
  axios.get(`${BASE_URL}/forms/sentiment/average`, {
    headers: getAuthHeaders(),
  });

// Get response counts for all forms
export const getResponseCounts = () =>
  axios.get(`${BASE_URL}/forms/responses/count`, {
    headers: getAuthHeaders(),
  });