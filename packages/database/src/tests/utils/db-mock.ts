import { vi, beforeEach, type Mock } from "bun:test";

interface IReturningChain {
  returning: Mock<(...args: unknown[]) => unknown>;
}

interface IWhereChain {
  where: Mock<
    (...args: unknown[]) => IReturningChain & {
      prepare: Mock<(...args: unknown[]) => unknown>;
      limit: Mock<(...args: unknown[]) => unknown>;
    }
  >;
}

interface IOnConflictDoUpdateChain {
  onConflictDoUpdate: Mock<(...args: unknown[]) => IReturningChain>;
}

interface IValuesChain {
  values: Mock<
    (...args: unknown[]) => IOnConflictDoUpdateChain & IReturningChain
  >;
}

interface ISetChain {
  set: Mock<(...args: unknown[]) => IWhereChain>;
}

export const mockReturning = vi.fn();
export const mockPrepare = vi.fn();
export interface IMockQueryChain {
  returning: Mock<(...args: unknown[]) => unknown>;
  prepare: Mock<(...args: unknown[]) => unknown>;
  limit: Mock<(...args: unknown[]) => unknown>;
  where: Mock<(...args: unknown[]) => IMockQueryChain>;
  innerJoin: () => IMockQueryChain;
  leftJoin: () => IMockQueryChain;
  groupBy: () => IMockQueryChain;
  orderBy: () => IMockQueryChain;
  then: (
    onfulfilled?: ((value: unknown) => unknown) | null,
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
  catch: (
    onrejected?: ((reason: unknown) => unknown) | null,
  ) => Promise<unknown>;
}

export const mockSelectResolvedValue = {
  value: [] as unknown,
  queue: [] as unknown[],
  mockResolvedValueOnce(val: unknown) {
    this.queue.push(val);
  },
  reset() {
    this.value = [];
    this.queue = [];
  },
  get(): unknown {
    if (this.queue.length > 0) {
      return this.queue.shift();
    }
    return this.value;
  },
};
export const mockLimit = vi
  .fn()
  .mockImplementation(() => Promise.resolve(mockSelectResolvedValue.get()));

const defaultWhere = (): IMockQueryChain => {
  const obj = {
    returning: mockReturning,
    prepare: mockPrepare,
    limit: mockLimit,
    where: mockWhere,
  } as unknown as IMockQueryChain;
  obj.innerJoin = () => obj;
  obj.leftJoin = () => obj;
  obj.groupBy = () => obj;
  obj.orderBy = () => obj;
  obj.then = (resolve) =>
    Promise.resolve(mockSelectResolvedValue.get()).then(resolve);
  obj.catch = (reject) =>
    Promise.resolve(mockSelectResolvedValue.get()).catch(reject);
  return obj;
};

const defaultFrom = (): IMockQueryChain => {
  const obj = {
    where: mockWhere,
    limit: mockLimit,
    returning: mockReturning,
    prepare: mockPrepare,
  } as unknown as IMockQueryChain;
  obj.innerJoin = () => obj;
  obj.leftJoin = () => obj;
  obj.groupBy = () => obj;
  obj.orderBy = () => obj;
  obj.then = (resolve) =>
    Promise.resolve(mockSelectResolvedValue.get()).then(resolve);
  obj.catch = (reject) =>
    Promise.resolve(mockSelectResolvedValue.get()).catch(reject);
  return obj;
};

export const mockWhere = vi.fn().mockImplementation(defaultWhere);
export const mockOnConflictDoUpdate = vi
  .fn()
  .mockImplementation(() => ({ returning: mockReturning }));
export const mockValues = vi.fn().mockImplementation(() => ({
  returning: mockReturning,
  onConflictDoUpdate: mockOnConflictDoUpdate,
}));
export const mockSet = vi.fn().mockImplementation(() => ({ where: mockWhere }));
export const mockFrom = vi.fn().mockImplementation(defaultFrom);

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
  .fn()
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
  transaction: vi
    .fn()
    .mockImplementation((cb: (tx: unknown) => unknown) => cb(mockDb)),
  query: {
    products: queryMocks,
    brands: queryMocks,
    categories: queryMocks,
    users: queryMocks,
    orders: queryMocks,
    warehouseStocks: queryMocks,
    warehouses: queryMocks,
    quotes: queryMocks,
    dealerTiers: queryMocks,
    carts: queryMocks,
    cartItems: queryMocks,
  },
};

await vi.mock("../../client", () => ({
  db: mockDb,
}));

beforeEach(() => {
  mockReturning.mockReset();
  mockFindFirst.mockReset();
  mockFindMany.mockReset();
  mockSelectResolvedValue.reset();
  mockLimit.mockReset();
  mockLimit.mockImplementation(() =>
    Promise.resolve(mockSelectResolvedValue.get()),
  );
  mockFrom.mockImplementation(defaultFrom);
  mockWhere.mockImplementation(defaultWhere);
});
