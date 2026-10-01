import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// Granice modułów z docs/PLAN_MVP.md §2. Moduł z zewnątrz jest dostępny
// tylko przez service/actions/schemas/components; wewnątrz modułu
// importy są względne.
const moduleBoundary = {
  group: [
    "@/modules/*/*",
    "!@/modules/*/service",
    "!@/modules/*/actions",
    "!@/modules/*/schemas",
    "!@/modules/*/components",
    "!@/modules/*/components/*",
  ],
  message:
    "Importuj moduł tylko przez service, actions, schemas lub components (docs/PLAN_MVP.md §2).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": ["error", { patterns: [moduleBoundary] }],
    },
  },
  {
    // Domena to czysta logika: bez bazy, frameworka i infrastruktury.
    files: ["src/modules/*/domain.ts", "src/modules/*/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            moduleBoundary,
            {
              group: [
                "@prisma/*",
                "@/generated/*",
                "next",
                "next/*",
                "react",
                "react-dom",
                "@/core/*",
                "@/app/*",
                "@/components/*",
                "./repository",
                "./service",
                "./actions",
              ],
              message:
                "domain.ts nie może zależeć od bazy, frameworka ani infrastruktury (docs/PLAN_MVP.md §1).",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
