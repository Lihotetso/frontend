// Use Render deployment URL in production, fallback to localhost for local dev
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://backend-2-kleu.onrender.com/api'
    : 'http://localhost:5000/api';

export default API_BASE_URL;
