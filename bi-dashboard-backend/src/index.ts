import { createApp } from './app';
import { checkDbConnection } from './db/pool';
import { config } from './config/env';

async function bootstrap(): Promise<void> {
  // Verify DB before accepting traffic
  await checkDbConnection();

  const app = createApp();

  const server = app.listen(config.server.port, () => {
    console.log(
      `[server] DataPulse API running on http://localhost:${config.server.port} ` +
      `(${config.server.nodeEnv})`,
    );
    console.log(`[server] API base: http://localhost:${config.server.port}/api`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n[server] ${signal} received — shutting down gracefully…`);
    server.close(() => {
      console.log('[server] HTTP server closed.');
      process.exit(0);
    });
    // Force-kill after 10 s if connections won't drain
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

bootstrap().catch((err: Error) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
