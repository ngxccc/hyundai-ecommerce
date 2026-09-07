/**
 * Encodes an i18n translation key and dynamic arguments into a token string.
 * Format: "key|{args_json}"
 *
 * Symmetrical with Backend's i18nZodMsg utility.
 */
export function i18nZodMsg(
  key: string,
  args?: Record<string, unknown>,
): string {
  return `${key}|${JSON.stringify(args ?? {})}`;
}

export interface DecodedZodToken {
  key: string;
  args: Record<string, unknown>;
}

export type I18nTranslator = (key: never, ...args: never[]) => string;

/**
 * Decodes a raw message string that might be an encoded i18n token:
 * "key|{args}" -> { key, args }
 */
export function parseI18nToken(raw: string): DecodedZodToken | null {
  if (!raw.includes("|")) {
    return null;
  }
  const pipeIndex = raw.indexOf("|");
  const key = raw.slice(0, pipeIndex).trim();
  const jsonStr = raw.slice(pipeIndex + 1).trim();

  let args: Record<string, unknown> = {};
  if (jsonStr.startsWith("{") && jsonStr.endsWith("}")) {
    try {
      const parsed = JSON.parse(jsonStr) as unknown;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        args = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return { key, args };
}

/**
 * Translates a raw message or encoded i18n token using the provided translator function.
 */
export function translateZodMessage(
  rawMessage: string,
  t: I18nTranslator,
): string {
  const token = parseI18nToken(rawMessage);
  if (token) {
    try {
      return t(token.key as never, token.args as never);
    } catch {
      return token.key;
    }
  }

  if (/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(rawMessage)) {
    try {
      return t(rawMessage as never);
    } catch {
      return rawMessage;
    }
  }

  return rawMessage;
}
