const request = require('supertest');
const app = require('../src/index');
const store = require('../src/data/store');

beforeEach(() => {
  store.reset();
});

describe('Health Check', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/risks', () => {
  test('creates a risk successfully', async () => {
    const res = await request(app).post('/api/risks').send({
      title: 'พื้นลื่นในโกดัง',
      description: 'พื้นมีคราบน้ำมัน เสี่ยงลื่นล้ม',
      level: 'high',
      location: 'โกดัง A',
      assignee: 'นายสมชาย',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('พื้นลื่นในโกดัง');
    expect(res.body.level).toBe('high');
    expect(res.body.status).toBe('open');
    expect(res.body.assignee).toBe('นายสมชาย');
  });

  test('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/risks').send({
      level: 'high',
      assignee: 'นายสมชาย',
    });
    expect(res.status).toBe(400);
  });

  test('returns 400 when assignee is missing', async () => {
    const res = await request(app).post('/api/risks').send({
      title: 'ความเสี่ยง',
      level: 'high',
    });
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid level', async () => {
    const res = await request(app).post('/api/risks').send({
      title: 'ความเสี่ยง',
      level: 'critical',
      assignee: 'นายสมชาย',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('level');
  });
});

describe('GET /api/risks', () => {
  beforeEach(async () => {
    await request(app).post('/api/risks').send({ title: 'ความเสี่ยง A', level: 'high', assignee: 'นายสมชาย' });
    await request(app).post('/api/risks').send({ title: 'ความเสี่ยง B', level: 'low', assignee: 'นางสมศรี' });
  });

  test('returns all risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('filters by level', async () => {
    const res = await request(app).get('/api/risks?level=high');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].level).toBe('high');
  });

  test('filters by assignee', async () => {
    const res = await request(app).get(`/api/risks?assignee=${encodeURIComponent('สมชาย')}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].assignee).toBe('นายสมชาย');
  });
});

describe('GET /api/risks/:id', () => {
  test('returns risk by id', async () => {
    const created = await request(app)
      .post('/api/risks')
      .send({ title: 'ทดสอบ', level: 'medium', assignee: 'นายทดสอบ' });
    const res = await request(app).get(`/api/risks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  test('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/api/risks/non-existent-id');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/risks/:id', () => {
  test('updates status to in_progress', async () => {
    const created = await request(app)
      .post('/api/risks')
      .send({ title: 'ความเสี่ยง', level: 'high', assignee: 'นายสมชาย' });

    const res = await request(app)
      .put(`/api/risks/${created.body.id}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  test('updates assignee', async () => {
    const created = await request(app)
      .post('/api/risks')
      .send({ title: 'ความเสี่ยง', level: 'high', assignee: 'นายสมชาย' });

    const res = await request(app)
      .put(`/api/risks/${created.body.id}`)
      .send({ assignee: 'นางสมศรี' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('นางสมศรี');
  });

  test('returns 400 for invalid status', async () => {
    const created = await request(app)
      .post('/api/risks')
      .send({ title: 'ความเสี่ยง', level: 'high', assignee: 'นายสมชาย' });

    const res = await request(app)
      .put(`/api/risks/${created.body.id}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
  });

  test('returns 404 for non-existent risk', async () => {
    const res = await request(app).put('/api/risks/non-existent').send({ status: 'resolved' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/risks/:id', () => {
  test('deletes a risk', async () => {
    const created = await request(app)
      .post('/api/risks')
      .send({ title: 'ความเสี่ยง', level: 'high', assignee: 'นายสมชาย' });

    const res = await request(app).delete(`/api/risks/${created.body.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/api/risks/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  test('returns 404 for non-existent risk', async () => {
    const res = await request(app).delete('/api/risks/non-existent');
    expect(res.status).toBe(404);
  });
});
