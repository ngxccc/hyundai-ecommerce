import { vi, type Mock } from "bun:test";

interface IReturningChain {
  returning: Mock<(...args: unknown[]) => unknown>;
}

interface IWhereChain {
  where: Mock<(...args: unknown[]) => IReturningChain>;
}

interface IValuesChain {
  values: Mock<(...args: unknown[]) => IReturningChain>;
}

interface ISetChain {
  set: Mock<(...args: unknown[]) => IWhereChain>;
}

export const mockReturning = vi.fn();
export const mockWhere = vi
  .fn()
  .mockImplementation(() => ({ returning: mockReturning }));
export const mockValues = vi
  .fn()
  .mockImplementation(() => ({ returning: mockReturning }));
export const mockSet = vi.fn().mockImplementation(() => ({ where: mockWhere }));

export const mockInsert = vi
  .fn<(...args: unknown[]) => IValuesChain>()
  .mockImplementation(() => ({ values: mockValues }));

export const mockUpdate = vi
  .fn<(...args: unknown[]) => ISetChain>()
  .mockImplementation(() => ({ set: mockSet }));

export const mockDelete = vi
  .fn<(...args: unknown[]) => IWhereChain>()
  .mockImplementation(() => ({ where: mockWhere }));

export const mockFindFirst = vi.fn();
export const mockFindMany = vi.fn();
export const mockDb = {
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  query: {
    products: {
      findFirst: mockFindFirst,
      findMany: mockFindMany,
    },
  },
};

await vi.mock("../../client", () => ({
  db: {
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    query: {
      products: {
        findFirst: mockFindFirst,
        findMany: mockFindMany,
      },
    },
  },
}));
