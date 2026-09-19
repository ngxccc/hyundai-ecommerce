---
name: enforce-backend-i18n-exceptions
description: "Enforce using typed I18n exceptions instead of raw Error or unlocalized NestJS HttpExceptions in backend services"
condition: "throw new (?:Error|NotFoundException|BadRequestException|ConflictException|ForbiddenException|UnauthorizedException|InternalServerErrorException|UnprocessableEntityException)\\("
scope: "tool:edit"
---

# Backend I18n Exception Standards

- **No Raw Errors or Unlocalized Exceptions**: Never throw raw `new Error(...)` or standard NestJS HTTP exceptions (`new NotFoundException(...)`, `new BadRequestException(...)`) directly in backend services or controllers.
- **Use Typed I18n Exceptions**: Always throw custom I18n exceptions from `@/common/exceptions` (e.g. `I18nNotFoundException`, `I18nBadRequestException`, `I18nInternalServerErrorException`) with valid `I18nPath` keys defined in `backend/src/i18n/{vi,en}/*.json`.
- **Keep I18n Types in Sync**: Run `bun run i18n:generate` whenever adding new keys to translation dictionaries so `i18n.generated.ts` reflects them.
