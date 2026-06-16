import { vi, beforeEach, type Mock } from "bun:test";

export interface ReturningChain {
  returning: Mock<(...args: unknown[]) => unknown>;
}

export interface WhereChain {
  where: Mock<
    (...args: unknown[]) => ReturningChain & {
      prepare: Mock<(...args: unknown[]) => unknown>;
      limit: Mock<(...args: unknown[]) => unknown>;
    }
  >;
}

export interface OnConflictDoUpdateChain {
  onConflictDoUpdate: Mock<(...args: unknown[]) => ReturningChain>;
}

export interface ValuesChain {
  values: Mock<
    (...args: unknown[]) => OnConflictDoUpdateChain & ReturningChain
  >;
}

export interface SetChain {
  set: Mock<(...args: unknown[]) => WhereChain>;
}

export const mockReturning = vi.fn();
export const mockPrepare = vi.fn();
export interface MockQueryChain {
  returning: Mock<(...args: unknown[]) => unknown>;
  prepare: Mock<(...args: unknown[]) => unknown>;
  limit: Mock<(...args: unknown[]) => unknown>;
  where: Mock<(...args: unknown[]) => MockQueryChain>;
  for: Mock<(...args: unknown[]) => MockQueryChain>;
  innerJoin: () => MockQueryChain;
  leftJoin: () => MockQueryChain;
  groupBy: () => MockQueryChain;
  orderBy: () => MockQueryChain;
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

const defaultWhere = (): MockQueryChain => {
  const obj = {
    returning: mockReturning,
    prepare: mockPrepare,
    limit: mockLimit,
    where: mockWhere,
  } as unknown as MockQueryChain;
  obj.innerJoin = () => obj;
  obj.leftJoin = () => obj;
  obj.groupBy = () => obj;
  obj.orderBy = () => obj;
  obj.for = vi.fn().mockImplementation(() => obj);
  obj.then = (resolve, reject) =>
    Promise.resolve(mockSelectResolvedValue.get()).then(resolve, reject);
  obj.catch = (reject) =>
    Promise.resolve(mockSelectResolvedValue.get()).catch(reject);
  return obj;
};

const defaultFrom = (): MockQueryChain => {
  const obj = {
    where: mockWhere,
    limit: mockLimit,
    returning: mockReturning,
    prepare: mockPrepare,
  } as unknown as MockQueryChain;
  obj.innerJoin = () => obj;
  obj.leftJoin = () => obj;
  obj.groupBy = () => obj;
  obj.orderBy = () => obj;
  obj.for = vi.fn().mockImplementation(() => obj);
  obj.then = (resolve, reject) =>
    Promise.resolve(mockSelectResolvedValue.get()).then(resolve, reject);
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
  .fn<(...args: unknown[]) => ValuesChain>()
  .mockImplementation(() => ({ values: mockValues }));

export const mockUpdate = vi
  .fn<(...args: unknown[]) => SetChain>()
  .mockImplementation(() => ({ set: mockSet }));

export const mockDelete = vi
  .fn<(...args: unknown[]) => WhereChain>()
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
