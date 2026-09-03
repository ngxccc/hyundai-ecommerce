import { describe, it, expect } from "bun:test";
import { parseRedisOptions } from "./redis.config";

describe("parseRedisOptions", () => {
  it("should parse standard redis:// TCP URL correctly", () => {
    const url = "redis://default:secretpass@redis.example.com:12524";
    const config = parseRedisOptions(url);

    expect(config.host).toBe("redis.example.com");
    expect(config.port).toBe(12524);
    expect(config.username).toBe("default");
    expect(config.password).toBe("secretpass");
    expect(config.tls).toBeUndefined();
    expect(config.enableReadyCheck).toBe(true);
    expect(config.skipVersionCheck).toBe(false);
  });

  it("should parse rediss:// SSL/TLS URL and set tls options", () => {
    const url = "rediss://default:secretpass@secure-redis.example.com:6379";
    const config = parseRedisOptions(url);

    expect(config.host).toBe("secure-redis.example.com");
    expect(config.port).toBe(6379);
    expect(config.tls).toEqual({
      rejectUnauthorized: false,
      servername: "secure-redis.example.com",
    });
    expect(config.enableReadyCheck).toBe(true);
    expect(config.skipVersionCheck).toBe(false);
  });

  it("should disable ready check and enable skip version check for Upstash URLs", () => {
    const url = "rediss://default:secretpass@complex-library.upstash.io:6379";
    const config = parseRedisOptions(url);

    expect(config.host).toBe("complex-library.upstash.io");
    expect(config.tls).toEqual({
      rejectUnauthorized: false,
      servername: "complex-library.upstash.io",
    });
    expect(config.enableReadyCheck).toBe(false);
    expect(config.skipVersionCheck).toBe(true);
  });
  it("should NOT treat malicious hostnames containing upstash.io substring as Upstash", () => {
    const url1 = "rediss://default:secretpass@fakeupstash.io:6379";
    const config1 = parseRedisOptions(url1);
    expect(config1.enableReadyCheck).toBe(true);
    expect(config1.skipVersionCheck).toBe(false);

    const url2 = "rediss://default:secretpass@upstash.io.attacker.com:6379";
    const config2 = parseRedisOptions(url2);
    expect(config2.enableReadyCheck).toBe(true);
    expect(config2.skipVersionCheck).toBe(false);
  });

  it("should fall back to fallback host/port when URL is missing port", () => {
    const url = "redis://default:secretpass@redis.example.com";
    const config = parseRedisOptions(url, "localhost", 6379);

    expect(config.host).toBe("redis.example.com");
    expect(config.port).toBe(6379);
  });

  it("should fall back gracefully when redisUrl is empty string or malformed", () => {
    const emptyConfig = parseRedisOptions("", "fallback-host", 6380);
    expect(emptyConfig.host).toBe("fallback-host");
    expect(emptyConfig.port).toBe(6380);

    const malformedConfig = parseRedisOptions(
      "invalid-url-string",
      "fallback-host",
      6380,
    );
    expect(malformedConfig.host).toBe("fallback-host");
    expect(malformedConfig.port).toBe(6380);
  });

  it("should fall back to REDIS_HOST and REDIS_PORT when REDIS_URL is undefined", () => {
    const config = parseRedisOptions(undefined, "127.0.0.1", 6379);

    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe(6379);
    expect(config.tls).toBeUndefined();
    expect(config.enableReadyCheck).toBeUndefined();
  });
});
