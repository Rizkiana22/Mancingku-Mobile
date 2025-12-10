import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import UserRoute from './src/routes/usersRoute.js';
import SpotRoute from './src/routes/spotsRoute.js';
import SessionRoute from './src/routes/sessionsRoute.js';
import AuthRoute from './src/routes/authRoute.js';
import BookingRoute from './src/routes/bookingsRoute.js';
import ReviewRoute from './src/routes/reviewRoute.js';
import BaitsRoute from './src/routes/baitsRoute.js';
import BlogRoute from './src/routes/blogRoute.js';
import FishingGearsRoute from './src/routes/fishingGearsRoute.js';

const app = express();
const port = 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',       // nanti kalau production ubah ini
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.json({ limit: '50kb' }));

app.use(express.json());
app.use(UserRoute);
app.use(SpotRoute);
app.use(SessionRoute);
app.use(AuthRoute);
app.use(BookingRoute);
app.use(ReviewRoute);
app.use(BaitsRoute);
app.use(BlogRoute);
app.use(FishingGearsRoute);

app.use((err, req, res, next) => {
  console.error('Error caught:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
