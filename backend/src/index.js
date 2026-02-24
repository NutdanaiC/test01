const express = require('express');
const cors = require('cors');
const risksRouter = require('./routes/risks');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/risks', risksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Safety Patrol API is running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Safety Patrol API running on port ${PORT}`);
  });
}

module.exports = app;
