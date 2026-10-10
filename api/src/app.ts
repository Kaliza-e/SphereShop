import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { metricsMiddleware, getMetrics } from "./middleware/metrics";
import { sessionMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import catalogueRoutes from "./routes/catalogueRoutes";
import cartRoutes from "./routes/cartRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import orderFulfillmentRoutes from "./routes/orderFulfillmentRoutes";
import returnRoutes from "./routes/returnRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import adminRoutes from "./routes/adminRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import testSupportRoutes from "./routes/testSupportRoutes";

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(metricsMiddleware);
app.use(sessionMiddleware);

// Health check endpoint (SEC-11: status ONLY)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Metrics endpoint
app.get("/metrics", async (_req, res) => {
  try {
    const metricsStr = await getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metricsStr);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// API v1 routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", catalogueRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", checkoutRoutes);
app.use("/api/v1", orderFulfillmentRoutes);
app.use("/api/v1", returnRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/test-support", testSupportRoutes);

// Fallback 404
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
      referenceId: `REF-${Date.now()}`
    }
  });
});

app.use(errorHandler);

export default app;
