// In-memory data store
let risks = [];

const getAll = () => risks;

const getById = (id) => risks.find((r) => r.id === id);

const create = (risk) => {
  risks.push(risk);
  return risk;
};

const update = (id, updates) => {
  const index = risks.findIndex((r) => r.id === id);
  if (index === -1) return null;
  risks[index] = { ...risks[index], ...updates, updatedAt: new Date().toISOString() };
  return risks[index];
};

const remove = (id) => {
  const index = risks.findIndex((r) => r.id === id);
  if (index === -1) return false;
  risks.splice(index, 1);
  return true;
};

const reset = () => {
  risks = [];
};

module.exports = { getAll, getById, create, update, remove, reset };
