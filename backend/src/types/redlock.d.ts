// WHY: Redlock v5 package uses CJS `export = Redlock` export syntax which fails ESM resolution under TypeScript's `verbatimModuleSyntax` and `moduleResolution: "bundler"`. This ambient module declaration bridges the ESM default import shape while keeping strict compiler flags intact.
declare module "redlock" {
  export interface Lock {
    resources: string[];
    expiration: number;
    value: string;
    release(): Promise<void>;
    extend(ttl: number): Promise<Lock>;
  }

  export interface Options {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  export default class Redlock {
    constructor(clients: unknown[], options?: Options);
    acquire(resources: string[], ttl: number, options?: Options): Promise<Lock>;
    release(lock: Lock): Promise<void>;
    using<T>(
      resources: string[],
      ttl: number,
      routine: (signal: unknown) => Promise<T>,
    ): Promise<T>;
  }
}
