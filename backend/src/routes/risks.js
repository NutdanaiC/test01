const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');

const router = express.Router();

const VALID_LEVELS = ['high', 'medium', 'low'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved'];

// GET /api/risks
router.get('/', (req, res) => {
  const { status, level, assignee } = req.query;
  let risks = store.getAll();

  if (status) risks = risks.filter((r) => r.status === status);
  if (level) risks = risks.filter((r) => r.level === level);
  if (assignee) risks = risks.filter((r) => r.assignee.toLowerCase().includes(assignee.toLowerCase()));

  res.json(risks);
});

// GET /api/risks/:id
router.get('/:id', (req, res) => {
  const risk = store.getById(req.params.id);
  if (!risk) return res.status(404).json({ error: 'Risk not found' });
  res.json(risk);
});

// POST /api/risks
router.post('/', (req, res) => {
  const { title, description, level, location, assignee } = req.body;

  if (!title || !level || !assignee) {
    return res.status(400).json({ error: 'title, level, and assignee are required' });
  }

  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(', ')}` });
  }

  const risk = {
    id: uuidv4(),
    title,
    description: description || '',
    level,
    location: location || '',
    assignee,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.create(risk);
  res.status(201).json(risk);
});

// PUT /api/risks/:id
router.put('/:id', (req, res) => {
  const { title, description, level, location, assignee, status } = req.body;

  if (level && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(', ')}` });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const updated = store.update(req.params.id, { title, description, level, location, assignee, status });
  if (!updated) return res.status(404).json({ error: 'Risk not found' });

  res.json(updated);
});

// DELETE /api/risks/:id
router.delete('/:id', (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Risk not found' });
  res.status(204).send();
});

module.exports = router;
