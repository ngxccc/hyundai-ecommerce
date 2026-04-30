import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const primaryKeyUuid = {
  id: uuid().primaryKey().$defaultFn(uuidv7),
};

export const activeStatus = {
  isActive: boolean().default(true).notNull(),
};

export const baseTimestamps = {
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() /* @__PURE__ */ => new Date())
    .notNull(),
};

export const softDeleteTimestamp = {
  deletedAt: timestamp({ withTimezone: true, mode: "date" }),
};

export const fullEntity = {
  ...primaryKeyUuid,
  ...baseTimestamps,
  ...softDeleteTimestamp,
};

export const baseEntity = {
  ...primaryKeyUuid,
  ...baseTimestamps,
};
