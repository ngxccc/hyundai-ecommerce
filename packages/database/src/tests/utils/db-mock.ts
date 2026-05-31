import { vi, type Mock } from "bun:test";

interface IReturningChain {
  returning: Mock<(...args: unknown[]) => unknown>;
}

interface IWhereChain {
  where: Mock<(...args: unknown[]) => IReturningChain & { prepare: Mock<(...args: unknown[]) => unknown>; limit: Mock<(...args: unknown[]) => unknown> }>;
}

interface IOnConflictDoUpdateChain {
  onConflictDoUpdate: Mock<(...args: unknown[]) => IReturningChain>;
}

interface IValuesChain {
  values: Mock<(...args: unknown[]) => IOnConflictDoUpdateChain & IReturningChain>;
}

interface ISetChain {
  set: Mock<(...args: unknown[]) => IWhereChain>;
}

interface IFromChain {
  from: Mock<(...args: unknown[]) => IWhereChain>;
}

export const mockReturning = vi.fn();
export const mockPrepare = vi.fn();
export const mockLimit = vi.fn();
export const mockWhere = vi
  .fn()
  .mockImplementation(() => ({ returning: mockReturning, prepare: mockPrepare, limit: mockLimit }));
export const mockOnConflictDoUpdate = vi
  .fn()
  .mockImplementation(() => ({ returning: mockReturning }));
export const mockValues = vi
  .fn()
  .mockImplementation(() => ({
    returning: mockReturning,
    onConflictDoUpdate: mockOnConflictDoUpdate,
  }));
export const mockSet = vi.fn().mockImplementation(() => ({ where: mockWhere }));
export const mockFrom = vi.fn().mockImplementation(() => ({ where: mockWhere }));

export const mockInsert = vi
  .fn<(...args: unknown[]) => IValuesChain>()
  .mockImplementation(() => ({ values: mockValues }));

export const mockUpdate = vi
  .fn<(...args: unknown[]) => ISetChain>()
  .mockImplementation(() => ({ set: mockSet }));

export const mockDelete = vi
  .fn<(...args: unknown[]) => IWhereChain>()
  .mockImplementation(() => ({ where: mockWhere }));

export const mockSelect = vi
  .fn<(...args: unknown[]) => IFromChain>()
  .mockImplementation(() => ({ from: mockFrom }));

export const mockFindFirst = vi.fn();
export const mockFindMany = vi.fn();

const queryMocks = {
  findFirst: mockFindFirst,
  findMany: mockFindMany,
};

export const mockDb = {
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  select: mockSelect,
  query: {
    products: queryMocks,
    brands: queryMocks,
    categories: queryMocks,
    users: queryMocks,
    orders: queryMocks,
    warehouseStocks: queryMocks,
    warehouses: queryMocks,
  },
};

await vi.mock("../../client", () => ({
  db: mockDb,
}));
