import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import compression from "compression"; // Added for response compression

// Routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import analyticsRouter from './routes/analyticsRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
dotenv.config();

const app = express();

// 1. FIX THE TRUST PROXY ERROR
app.set('trust proxy', 1); // Trust first proxy (Render.com's load balancer)

// 2. CONNECT TO DATABASE FIRST
connectDB();

// 3. OPTIMIZED MIDDLEWARE SETUP
// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Better security practice
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression middleware (gzip responses)
app.use(compression());

// 4. IMPROVED LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // More detailed logs for production
}

// 5. OPTIMIZED RATE LIMITING
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: 'Too many requests from this IP, please try again later',
  validate: { trustProxy: true } // Explicitly trust proxy
});

// Apply rate limit to API routes only
app.use('/api/', apiLimiter);

// 6. ROUTES WITH CACHING HEADERS
// Health check endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin", adminRoutes);

// 7. ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});