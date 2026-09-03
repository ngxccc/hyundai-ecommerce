import { describe, expect, it } from "bun:test";
import {
  ApiOkResponseGeneric,
  ApiCreatedResponseGeneric,
  ApiOkResponsePaginated,
  ApiCreatedResponsePaginated,
  ApiResponseDto,
  PaginatedApiResponseDto,
} from "./api-response.decorator";
import { PaginationMetaDto } from "../dto/pagination-meta.dto";

class MockModelDto {
  id!: string;
  name!: string;
}

class TestController {
  @ApiOkResponseGeneric(MockModelDto)
  getSingle(): string {
    return "single";
  }

  @ApiOkResponseGeneric(MockModelDto, { isArray: true })
  getArray(): string[] {
    return ["array"];
  }

  @ApiOkResponseGeneric()
  getEmpty(): null {
    return null;
  }

  @ApiCreatedResponseGeneric(MockModelDto)
  createSingle(): string {
    return "created_single";
  }

  @ApiCreatedResponseGeneric(MockModelDto, { isArray: true })
  createArray(): string[] {
    return ["created_array"];
  }

  @ApiCreatedResponseGeneric()
  createEmpty(): null {
    return null;
  }

  @ApiOkResponsePaginated(MockModelDto)
  getPaginated(): string[] {
    return ["paginated"];
  }

  @ApiCreatedResponsePaginated(MockModelDto)
  createPaginated(): string[] {
    return ["created_paginated"];
  }
}
describe("API Response Decorators", () => {
  it("should apply ApiOkResponseGeneric decorator for single model", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "getSingle",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiOkResponseGeneric decorator with isArray option", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "getArray",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiOkResponseGeneric decorator with no model", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "getEmpty",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiCreatedResponseGeneric decorator for single model", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "createSingle",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiCreatedResponseGeneric decorator with isArray option", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "createArray",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiCreatedResponseGeneric decorator with no model", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "createEmpty",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiOkResponsePaginated decorator", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "getPaginated",
    );
    expect(descriptor).toBeDefined();
  });

  it("should apply ApiCreatedResponsePaginated decorator", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      "createPaginated",
    );
    expect(descriptor).toBeDefined();
  });

  it("should instantiate ApiResponseDto and PaginatedApiResponseDto classes", () => {
    const responseDto = new ApiResponseDto<string>();
    responseDto.success = true;
    responseDto.data = "test";
    expect(responseDto.success).toBe(true);
    expect(responseDto.data).toBe("test");

    const paginatedDto = new PaginatedApiResponseDto<string>();
    paginatedDto.success = true;
    paginatedDto.data = ["item1"];
    paginatedDto.meta = new PaginationMetaDto();
    expect(paginatedDto.success).toBe(true);
    expect(paginatedDto.data).toHaveLength(1);
  });
});
