import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { I18nPath } from "@/generated/i18n.generated";

export interface I18nExceptionPayload {
  message: I18nPath;
  args?: Record<string, unknown>;
  code?: string;
}

export type I18nKeyOrPayload = I18nPath | I18nExceptionPayload;

function normalizePayload(
  keyOrPayload: I18nKeyOrPayload,
  args?: Record<string, unknown>,
  code?: string,
): { message: string; args?: Record<string, unknown>; code?: string } {
  if (typeof keyOrPayload === "string") {
    return {
      message: keyOrPayload,
      ...(args ? { args } : {}),
      ...(code ? { code } : {}),
    };
  }
  return {
    message: keyOrPayload.message,
    ...(keyOrPayload.args ? { args: keyOrPayload.args } : {}),
    ...(keyOrPayload.code ? { code: keyOrPayload.code } : {}),
  };
}

export class I18nBadRequestException extends BadRequestException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}

export class I18nNotFoundException extends NotFoundException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}

export class I18nConflictException extends ConflictException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}

export class I18nForbiddenException extends ForbiddenException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}

export class I18nUnauthorizedException extends UnauthorizedException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}

export class I18nUnprocessableEntityException extends UnprocessableEntityException {
  constructor(
    keyOrPayload: I18nKeyOrPayload,
    args?: Record<string, unknown>,
    code?: string,
  ) {
    super(normalizePayload(keyOrPayload, args, code));
  }
}
