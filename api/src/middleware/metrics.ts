import client from "prom-client";
import { Request, Response, NextFunction } from "express";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

export const httpErrorsTotal = new client.Counter({
  name: "http_errors_total",
  help: "Total number of HTTP 5xx errors",
  labelNames: ["method", "route", "status_code"]
});

export const ordersTotal = new client.Counter({
  name: "sphereshop_orders_total",
  help: "Total orders created by status",
  labelNames: ["status"]
});

export const paymentsTotal = new client.Counter({
  name: "sphereshop_payments_total",
  help: "Total payments by outcome",
  labelNames: ["outcome"]
});

export const webhookDuplicatesTotal = new client.Counter({
  name: "sphereshop_webhook_duplicates_total",
  help: "Total duplicate webhook calls received"
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(ordersTotal);
register.registerMetric(paymentsTotal);
register.registerMetric(webhookDuplicatesTotal);

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    const status = res.statusCode.toString();

    httpRequestDurationSeconds.observe({ method: req.method, route, status_code: status }, durationInSeconds);
    httpRequestsTotal.inc({ method: req.method, route, status_code: status });

    if (res.statusCode >= 500) {
      httpErrorsTotal.inc({ method: req.method, route, status_code: status });
    }
  });

  next();
}

export async function getMetrics(): Promise<string> {
  return await register.metrics();
}
