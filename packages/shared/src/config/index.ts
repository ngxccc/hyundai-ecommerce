export interface SharedConfig {
  vatRate: number;
  depositRate: number;
  payosClientId: string;
  payosApiKey: string;
  payosChecksumKey: string;
  nextPublicAppUrl: string;
  isProduction: boolean;
}

let activeConfig: SharedConfig | null = null;

/**
 * Initializes the shared configuration registry with validated environment variables.
 * Call this at application bootstrap (e.g. Next.js instrumentation.ts or top-level entrypoint).
 */
export function initializeSharedConfig(config: SharedConfig): void {
  activeConfig = config;
}

/**
 * Retrieves the active configuration. Falls back to process.env variables
 * if the registry has not been initialized (useful for tests and transition phases).
 */
export function getSharedConfig(): SharedConfig {
  if (!activeConfig) {
    return {
      vatRate: process.env["VAT_RATE"]
        ? parseFloat(process.env["VAT_RATE"])
        : 0.1,
      depositRate: process.env["DEPOSIT_RATE"]
        ? parseFloat(process.env["DEPOSIT_RATE"])
        : 0.2,
      payosClientId: process.env["PAYOS_CLIENT_ID"] ?? "mock_client_id",
      payosApiKey: process.env["PAYOS_API_KEY"] ?? "mock_api_key",
      payosChecksumKey:
        process.env["PAYOS_CHECKSUM_KEY"] ?? "mock_checksum_key",
      nextPublicAppUrl:
        process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000",
      isProduction: process.env["NODE_ENV"] === "production",
    };
  }
  return activeConfig;
}
