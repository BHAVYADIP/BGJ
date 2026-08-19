import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { checkEmailWithHibp } from './providers/hibp.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many checks. Please wait a minute.' }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bgj-cyber-chaukidaar' }));

app.post('/api/breach-check', limiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    const result = await checkEmailWithHibp(email);
    return res.json({ ...result, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[breach-check]', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Breach check failed.' });
  }
});

app.use(express.static('dist'));

app.use((error, _req, res, _next) => {
  console.error('[server]', error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => console.log(`BGJ server listening on :${port}`));
