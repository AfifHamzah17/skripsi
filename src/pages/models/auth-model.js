// src/models/authModel.js
const API_BASE = 'https://skripsi-api-995782183824.asia-southeast2.run.app';

export const registerUser = async ({ email, password, username }) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  });
  return response.json(); // { error: boolean, message: string, result? }
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json(); // { error: boolean, message: string, result? }
};
