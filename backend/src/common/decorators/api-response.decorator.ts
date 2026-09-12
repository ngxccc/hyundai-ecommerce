import { applyDecorators, SetMetadata } from "@nestjs/common";
import type { Type } from "@nestjs/common";
import { ZOD_RESPONSE_METADATA } from "../interceptors/zod-response-validation.interceptor";
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from "@nestjs/swagger";
import { PaginationMetaDto } from "../dto/pagination-meta.dto";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  data!: T;
}

export class PaginatedApiResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  data!: T[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

const createApiResponseGeneric = (
  responseDecorator: typeof ApiOkResponse,
  model?: Type,
  options?: { isArray?: boolean },
) => {
  if (!model) {
    return applyDecorators(
      ApiExtraModels(ApiResponseDto),
      responseDecorator({
        schema: {
          allOf: [
            { $ref: getSchemaPath(ApiResponseDto) },
            {
              properties: {
                data: {
                  type: "object",
                  nullable: true,
                  default: null,
                },
              },
            },
          ],
        },
      }),
    );
  }

  const isArray = options?.isArray ?? false;
  const dataSchema = isArray
    ? {
        type: "array",
        items: { $ref: getSchemaPath(model) },
      }
    : {
        $ref: getSchemaPath(model),
      };

  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    SetMetadata(ZOD_RESPONSE_METADATA, {
      model,
      isArray,
      isPaginated: false,
    }),
    responseDecorator({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: dataSchema,
            },
          },
        ],
      },
    }),
  );
};

export const ApiOkResponseGeneric = (
  model?: Type,
  options?: { isArray?: boolean },
) => createApiResponseGeneric(ApiOkResponse, model, options);

export const ApiCreatedResponseGeneric = (
  model?: Type,
  options?: { isArray?: boolean },
) => createApiResponseGeneric(ApiCreatedResponse, model, options);

const createApiPaginatedResponse = (
  responseDecorator: typeof ApiOkResponse,
  model: Type,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedApiResponseDto, PaginationMetaDto, model),
    SetMetadata(ZOD_RESPONSE_METADATA, {
      model,
      isArray: false,
      isPaginated: true,
    }),
    responseDecorator({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedApiResponseDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                $ref: getSchemaPath(PaginationMetaDto),
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiOkResponsePaginated = (model: Type) =>
  createApiPaginatedResponse(ApiOkResponse, model);

export const ApiCreatedResponsePaginated = (model: Type) =>
  createApiPaginatedResponse(ApiCreatedResponse, model);
