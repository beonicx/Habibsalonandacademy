const pino = require("pino");

const isProduction = process.env.ENVIRONMENT === "production";

function hasPinoPretty() {
  try { require.resolve("pino-pretty"); return true; } catch { return false; }
}

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {
        formatters: {
          level(label) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : hasPinoPretty()
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          },
        }
      : {}),
});

module.exports = logger;
