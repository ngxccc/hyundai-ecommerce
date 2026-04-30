import { defineConfig } from "eslint/config";

export default defineConfig([
  // FEATURE BOUNDARY ENFORCEMENT (Ranh giới thép cho Features)
  {
    files: ["apps/**/src/features/**/*.ts", "apps/**/src/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // 1. ÉP BUỘC Encapsulation: Chỉ được import qua public interface (index.ts)
              //    Cấm chọc thẳng vào file con bên trong feature khác
              group: [
                "@/features/*/*",
                "!@/features/*/index",
                "!@/features/*/index.ts",
                "!@/features/*/index.tsx",
              ],
              message:
                "Private internal access! Chỉ được import từ public interface (index.ts) của feature. Không được chọc thẳng vào file nội bộ.",
            },
            {
              // 2. NGĂN Feature import ngược từ App Router layer (UI Layer)
              //    Giữ nguyên tắc UI Agnostic + Dependency Rule
              group: ["@/app/**", "@/app/*"],
              message:
                "Features KHÔNG được import từ Next.js App layer (app/). App layer chỉ được gọi feature, không ngược lại.",
            },
            {
              // 3. NGĂN Barrel File tự import chính nó (Circular via Barrel)
              group: ["**/index.{ts,tsx}"],
              message:
                "Barrel file không được import chính nó. Hãy import file cụ thể thay vì index.ts (tránh circular dependency).",
            },
            {
              // 4. Cấm import từ shared/services trực tiếp trong feature (nên đi qua index)
              group: ["@/shared/services/*", "!@/shared/services/index"],
              message:
                "Chỉ import từ @/shared/services (public interface), không import thẳng file con.",
            },
          ],
        },
      ],

      // Tăng cường anti-circular (kết hợp với import-x/no-cycle)
      "import-x/no-cycle": [
        "error",
        {
          maxDepth: 4,
          ignoreExternal: true,
          allowUnsafeDynamicCyclicDependency: false,
        },
      ],
    },
  },

  // SHARED LAYER PROTECTION
  {
    files: ["apps/**/src/shared/**/*.ts", "apps/**/src/shared/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/features/**"],
              message:
                "Shared layer không nên import từ features. Shared phải độc lập.",
            },
          ],
        },
      ],
    },
  },
]);
