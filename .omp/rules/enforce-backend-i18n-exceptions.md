---
name: enforce-backend-i18n-exceptions
description: "Throw typed I18n exceptions with I18nPath keys in backend services instead of raw Error or generic NestJS HttpExceptions"
condition: "throw\\s+new\\s+(?:Error|NotFoundException|BadRequestException|ConflictException|ForbiddenException|UnauthorizedException|InternalServerErrorException|UnprocessableEntityException)\\("
scope:
  [
    "tool:write(backend/src/modules/**/*.service.ts)",
    "tool:edit(backend/src/modules/**/*.service.ts)",
  ]
---

# Backend I18n Exceptions

Throw custom I18n exceptions from `@/common/exceptions`:

1. **Exception Types**: `I18nNotFoundException`, `I18nBadRequestException`, `I18nConflictException`, `I18nUnauthorizedException`, `I18nUnprocessableEntityException`.
2. **Keys**: Pass strongly-typed `I18nPath` keys from `backend/src/i18n/{vi,en}/*.json`.
3. **Sync**: Run `bun run i18n:generate` after adding keys to refresh `i18n.generated.ts`.
