// API base URL — set VITE_API_URL in .env for production builds.
const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const API_BASE = `${backendUrl}/api/parts`;
