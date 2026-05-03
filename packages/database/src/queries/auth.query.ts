import { db } from "../client";

/**
 * Tìm user theo số điện thoại
 * @param phone - Số điện thoại cần tìm
 * @returns User object (chỉ chứa id) hoặc undefined nếu không tìm thấy
 */
export const findUserByPhone = async (phone: string) =>
  await db.query.users.findFirst({
    where: {
      phone,
    },
    columns: { id: true },
  });

/**
 * Tìm user theo email
 * @param email - email cần tìm
 * @returns User object (chỉ chứa id) hoặc undefined nếu không tìm thấy
 */
export const findUserByEmail = async (email: string) =>
  await db.query.users.findFirst({
    where: {
      email,
    },
    columns: { id: true },
  });

/**
 * Kiểm tra trùng email hoặc phone
 * @param email - email cần tìm
 * @param phone - phone cần tìm
 * @returns object chứa cả hai hoặc undefined nếu không tìm thấy
 */
export const checkDuplicateUser = async (email: string, phone: string) =>
  await db.query.users.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
    columns: { email: true, phone: true },
  });
