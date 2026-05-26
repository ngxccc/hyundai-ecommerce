import { defineConfig } from "eslint/config";

export default defineConfig([
  // FEATURE BOUNDARY ENFORCEMENT (Ranh giới thép cho Features)
  {
    files: [
      "apps/**/src/features/**/*.ts",
      "apps/**/src/features/**/*.tsx",
      "src/features/**/*.ts",
      "src/features/**/*.tsx",
    ],
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
                "!@/features/*/hooks",
                "!@/features/*/hooks/**",
                "!@/features/*/components",
                "!@/features/*/components/**",
                "!@/features/*/types",
                "!@/features/*/types/**",
                "!@/features/*/services",
                "!@/features/*/services/**",
                "!@/features/*/stores",
                "!@/features/*/stores/**",
                "!@/features/*/utils",
                "!@/features/*/utils/**",
                "!@/features/*/actions",
                "!@/features/*/actions/**",
                "@/features/*/*/*",
                "!@/features/*/*/index",
                "!@/features/*/*/index.ts",
                "!@/features/*/*/index.tsx",
              ],
              message:
                "Private internal access! Import is only allowed from public interfaces (index.ts), sub-barrels (hooks, components, etc.), or safe deep imports. Direct access to internal files is forbidden.",
            },
            {
              // 2. NGĂN Feature import ngược từ App Router layer (UI Layer)
              //    Giữ nguyên tắc UI Agnostic + Dependency Rule
              group: ["@/app/**", "@/app/*"],
              message:
                "Features MUST NOT import from the Next.js App layer (app/). The App layer can call features, but not vice versa.",
            },
            {
              // 3. Cấm import từ shared/services trực tiếp trong feature (nên đi qua index)
              group: ["@/shared/services/*", "!@/shared/services/index"],
              message:
                "Only import from @/shared/services (public interface), do not import internal files directly.",
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

      // Ngăn import chính file hiện tại qua bất kỳ đường dẫn nào (./index, alias, ...)
      "import-x/no-self-import": "error",
    },
  },

  // APP LAYER FEATURE GATEKEEPING
  {
    files: [
      "apps/**/app/**/*.ts",
      "apps/**/app/**/*.tsx",
      "app/**/*.ts",
      "app/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Cho phép import từ public barrel của feature/sub-feature hoặc deep import (để tránh Server/Client leakage).
              group: [
                "@/features/*/*/*",
                "!@/features/*/*/index",
                "!@/features/*/*/index.ts",
                "!@/features/*/*/index.tsx",
                "!@/features/*/hooks/**",
                "!@/features/*/components/**",
                "!@/features/*/types/**",
                "!@/features/*/services/**",
                "!@/features/*/stores/**",
                "!@/features/*/utils/**",
                "!@/features/*/actions/**",
              ],
              message:
                "The App layer is only allowed to import from public barrels or safe deep imports (components, hooks, etc.) of a feature. Importing other internal files is forbidden.",
            },
          ],
        },
      ],
    },
  },

  // FEATURE BARREL SELF-IMPORT GUARD (tránh index.ts import lại chính nó)
  {
    files: [
      "apps/**/src/features/**/index.ts",
      "apps/**/src/features/**/index.tsx",
      "src/features/**/index.ts",
      "src/features/**/index.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./index", "./index.ts", "./index.tsx"],
              message: "A barrel file must not import itself (./index).",
            },
          ],
        },
      ],
    },
  },

  // SHARED LAYER PROTECTION
  {
    files: [
      "apps/**/src/shared/**/*.ts",
      "apps/**/src/shared/**/*.tsx",
      "src/shared/**/*.ts",
      "src/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/features/**"],
              message:
                "The Shared layer should not import from Features. The Shared layer must remain independent.",
            },
          ],
        },
      ],
    },
  },
]);
