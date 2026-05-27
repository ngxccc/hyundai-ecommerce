import { type IDatabase } from "../client";

export class UserService {
  constructor(protected readonly db: IDatabase) {}

  /**
   * Tìm user theo số điện thoại
   * @param phone - Số điện thoại cần tìm
   * @returns User object (chỉ chứa id) hoặc undefined nếu không tìm thấy
   */
  async findByPhone(phone: string) {
    return await this.db.query.users.findFirst({
      where: {
        phone,
      },
      columns: { id: true },
    });
  }

  /**
   * Tìm user theo email
   * @param email - email cần tìm
   * @returns User object (chỉ chứa id) hoặc undefined nếu không tìm thấy
   */
  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: {
        email,
      },
      columns: { id: true },
    });
  }

  /**
   * Kiểm tra trùng email hoặc phone
   * @param email - email cần tìm
   * @param phone - phone cần tìm
   * @returns object chứa cả hai hoặc undefined nếu không tìm thấy
   */
  async checkDuplicateUser(email: string, phone: string) {
    return await this.db.query.users.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
      columns: { email: true, phone: true },
    });
  }
}
