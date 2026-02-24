const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchRisks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/risks${params ? `?${params}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch risks');
  return res.json();
};

export const createRisk = async (data) => {
  const res = await fetch(`${BASE_URL}/risks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create risk');
  }
  return res.json();
};

export const updateRisk = async (id, data) => {
  const res = await fetch(`${BASE_URL}/risks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update risk');
  }
  return res.json();
};

export const deleteRisk = async (id) => {
  const res = await fetch(`${BASE_URL}/risks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete risk');
};
