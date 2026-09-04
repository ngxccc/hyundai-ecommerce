import { loginSchema } from "@/modules/auth/dto/login.dto";
import { createLeadSchema } from "@/modules/leads/dto/create-lead.dto";
import { updateLeadStatusSchema } from "@/modules/leads/dto/update-lead-status.dto";
import { measureBenchmark, type BenchmarkMetric } from "./benchmark.util";

export function runBenchmark(): BenchmarkMetric[] {
  const ITERATIONS = 10000;
  const WARMUP = 1000;

  // 1. Small DTO (Login)
  const loginPayload = {
    email: "user@example.com",
    password: "Password123!",
  };

  // 2. Complex DTO (Storefront Lead / RFQ Submission)
  const createLeadPayload = {
    fullName: "Nguyễn Văn An",
    phoneNumber: "0912345678",
    email: "an.nguyen@example.com",
    companyName: "Công ty TNHH Cơ điện Bình Dương",
    city: "Bình Dương",
    ward: "Phường Dĩ An",
    streetAddress: "KCN Sóng Thần 1",
    notes: "Cần tư vấn máy phát điện diesel 60kVA kèm tủ ATS cho nhà máy may",
    items: [
      {
        productId: "019fa8bc-8f4d-7000-b366-e691f45cfb8f",
        quantity: 1,
      },
    ],
  };

  // 3. Status Update DTO (Lead Status)
  const updateStatusPayload = {
    status: "CONTACTING",
    lostReason: "Khách hàng đổi nhu cầu",
  };

  const results: BenchmarkMetric[] = [];

  results.push(
    measureBenchmark(
      "Zod Validation: loginSchema (Small DTO, Valid)",
      () => {
        loginSchema.parse(loginPayload);
      },
      ITERATIONS,
      WARMUP,
    ),
  );

  results.push(
    measureBenchmark(
      "Zod Validation: createLeadSchema (Complex Nested Array DTO, Valid)",
      () => {
        createLeadSchema.parse(createLeadPayload);
      },
      ITERATIONS,
      WARMUP,
    ),
  );

  results.push(
    measureBenchmark(
      "Zod Validation: updateLeadStatusSchema (Enum DTO, Valid)",
      () => {
        updateLeadStatusSchema.parse(updateStatusPayload);
      },
      ITERATIONS,
      WARMUP,
    ),
  );

  return results;
}
