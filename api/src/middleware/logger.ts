import winston from "winston";

const SENSITIVE_KEYS = [
  "password",
  "confirmPassword",
  "newPassword",
  "token",
  "otp",
  "code",
  "deliveryCode",
  "pin",
  "cardNumber",
  "cvv",
  "secret",
  "authorization"
];

export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    // If it looks like JSON, try parsing
    try {
      const parsed = JSON.parse(obj);
      return JSON.stringify(redactSensitiveData(parsed));
    } catch {
      return obj;
    }
  }
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(s => lowerKey.includes(s.toLowerCase()));

    if (isSensitive) {
      redacted[key] = "[REDACTED]";
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      redacted[key] = redactSensitiveData(obj[key]);
    } else {
      redacted[key] = obj[key];
    }
  }
  return redacted;
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
