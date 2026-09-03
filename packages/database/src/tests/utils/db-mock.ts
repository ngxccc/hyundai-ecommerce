/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Factory: produces a fully isolated set of mock references and a MockDb.
 * Call this once per test file (or per describe) to prevent cross-file state leakage.
 */
export function createDbMocks() {
  const returning = vi.fn<(...args: any[]) => Promise<any>>();
  const prepare = vi.fn<(...args: any[]) => any>();
  const selectResolvedValue = {
    value: [] as unknown,
    queue: [] as unknown[],
    mockResolvedValueOnce(val: unknown) {
      this.queue.push(val);
      return this;
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

  const limit = vi
    .fn<(...args: any[]) => Promise<any>>()
    .mockImplementation(() => Promise.resolve(selectResolvedValue.get()));

  const buildChain = (): MockQueryChain => {
    const obj = {
      returning,
      prepare,
      limit,
      where: null as unknown as Mock<(...args: any[]) => any>,
    } as unknown as MockQueryChain;
    obj.innerJoin = () => obj;
    obj.leftJoin = () => obj;
    obj.groupBy = () => obj;
    obj.orderBy = () => obj;
    obj.for = vi.fn().mockImplementation(() => obj);
    obj.then = (resolve, reject) =>
      Promise.resolve(selectResolvedValue.get()).then(resolve, reject);
    obj.catch = (reject) =>
      Promise.resolve(selectResolvedValue.get()).catch(reject);
    // bind where lazily so we always use the current `where` mock
    Object.defineProperty(obj, "where", {
      get() {
        return where;
      },
    });
    return obj;
  };

  const where: Mock<(...args: any[]) => any> = vi
    .fn<(...args: any[]) => any>()
    .mockImplementation(buildChain);
  const from = vi.fn<(...args: any[]) => any>().mockImplementation(buildChain);
  const onConflictDoUpdate = vi.fn().mockImplementation(() => ({ returning }));
  const values = vi
    .fn()
    .mockImplementation(() => ({ values, onConflictDoUpdate, returning }));
  const set = vi.fn().mockImplementation(() => ({ where }));
  const select = vi.fn().mockImplementation(() => ({ from }));
  const insert = vi
    .fn<(...args: unknown[]) => ValuesChain>()
    .mockImplementation(() => ({ values }));
  const update = vi
    .fn<(...args: unknown[]) => SetChain>()
    .mockImplementation(() => ({ set }));
  const deleteFn = vi
    .fn<(...args: unknown[]) => WhereChain>()
    .mockImplementation(() => ({ where }));
  const findFirst = vi.fn<(...args: any[]) => Promise<any>>();
  const findMany = vi.fn<(...args: any[]) => Promise<any>>();

  const queryMocks = { findFirst, findMany };

  const db = {
    insert,
    update,
    delete: deleteFn,
    select,
    transaction: vi
      .fn()
      .mockImplementation((cb: (tx: unknown) => unknown) => cb(db)),
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
      userAddresses: queryMocks,
    },
  };

  function reset() {
    returning.mockReset();
    prepare.mockReset();
    findFirst.mockReset();
    findMany.mockReset();
    selectResolvedValue.reset();
    limit.mockReset();
    limit.mockImplementation(() => Promise.resolve(selectResolvedValue.get()));
    from.mockImplementation(buildChain);
    where.mockImplementation(buildChain);
    insert.mockImplementation(() => ({ values }));
    update.mockImplementation(() => ({ set }));
    deleteFn.mockImplementation(() => ({ where }));
    select.mockImplementation(() => ({ from }));
    db.transaction.mockImplementation((cb: (tx: unknown) => unknown) => cb(db));
  }

  return {
    db,
    mockReturning: returning,
    mockPrepare: prepare,
    mockSelectResolvedValue: selectResolvedValue,
    mockLimit: limit,
    mockWhere: where,
    mockFrom: from,
    mockOnConflictDoUpdate: onConflictDoUpdate,
    mockValues: values,
    mockSet: set,
    mockSelect: select,
    mockInsert: insert,
    mockUpdate: update,
    mockDelete: deleteFn,
    mockFindFirst: findFirst,
    mockFindMany: findMany,
    resetDbMocks: reset,
  };
}

// ---------------------------------------------------------------------------
// Module-level singleton — required because `vi.mock` captures this reference
// at import time and it must be the same object the service receives.
// Use the factory to build it, then re-export each mock individually so
// existing test files that import them directly keep working.
// ---------------------------------------------------------------------------
const _mocks = createDbMocks();

export const mockReturning: Mock<(...args: any[]) => Promise<any>> =
  _mocks.mockReturning;
export const mockPrepare: Mock<(...args: any[]) => any> = _mocks.mockPrepare;
export const mockSelectResolvedValue = _mocks.mockSelectResolvedValue;
export const mockLimit: Mock<(...args: any[]) => Promise<any>> =
  _mocks.mockLimit;
export const mockWhere: Mock<(...args: any[]) => any> = _mocks.mockWhere;
export const mockFrom: Mock<(...args: any[]) => any> = _mocks.mockFrom;
export const mockOnConflictDoUpdate = _mocks.mockOnConflictDoUpdate;
export const mockValues = _mocks.mockValues;
export const mockSet = _mocks.mockSet;
export const mockSelect = _mocks.mockSelect;
export const mockInsert = _mocks.mockInsert;
export const mockUpdate = _mocks.mockUpdate;
export const mockDelete = _mocks.mockDelete;
export const mockFindFirst: Mock<(...args: any[]) => Promise<any>> =
  _mocks.mockFindFirst;
export const mockFindMany: Mock<(...args: any[]) => Promise<any>> =
  _mocks.mockFindMany;
export const mockDb = _mocks.db;

/**
 * Reset all module-level mocks to a clean state.
 * Called automatically in `beforeEach` for any test file that imports this module.
 * For test files that need full isolation (i.e. no shared singleton), use `createDbMocks()`.
 */
export function resetDbMocks() {
  _mocks.resetDbMocks();
}

await vi.mock("../../client", () => ({
  db: mockDb,
}));

beforeEach(() => {
  resetDbMocks();
});
