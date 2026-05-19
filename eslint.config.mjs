import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettierConfig from "eslint-config-prettier"

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // ─── Regras de qualidade ─────────────────────────────────────────────────
  {
    rules: {
      // Variáveis
      "prefer-const": "error",
      "no-var": "error",

      // Console — warn em dev, pode subir sem quebrar o build
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // React
      "react/self-closing-comp": "warn",
      "react/jsx-no-useless-fragment": "warn",

      // Imports
      "import/no-duplicates": "error",
    },
  },

  // ─── Prettier por último — desliga todas as regras de formatação ─────────
  prettierConfig,

  // ─── Ignora ──────────────────────────────────────────────────────────────
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
])
