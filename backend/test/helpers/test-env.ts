// Sets test environment variable defaults before any module imports are evaluated.
process.env["PAYOS_CHECKSUM_KEY"] ??=
  "test-payos-checksum-key-minimum-32-chars";
process.env["PAYOS_CLIENT_ID"] ??= "test-payos-client-id";
process.env["PAYOS_API_KEY"] ??= "test-payos-api-key";
process.env["OUTBOX_ENABLE_POLLING"] ??= "false";
process.env["PAYMENT_DRIVER"] ??= "mock";
process.env["MAIL_DRIVER"] ??= "log";
