export function shouldRejectUnauthorizedDatabaseSsl(): boolean {
  return process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';
}

export function getDatabaseSslOptions(): { rejectUnauthorized: boolean } {
  return {
    rejectUnauthorized: shouldRejectUnauthorizedDatabaseSsl(),
  };
}
