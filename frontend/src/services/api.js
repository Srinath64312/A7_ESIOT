const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = { 
  get: (p) => request(p), 
  post: (p,d) => request(p, {method:'POST',body:JSON.stringify(d)}), 
  put: (p,d) => request(p, {method:'PUT',body:JSON.stringify(d)}), 
  delete: (p) => request(p, {method:'DELETE'}) 
};
