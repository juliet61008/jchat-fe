import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    rules: {
      // 변수 관련
      "prefer-const": "error", // let → const 자동 변환
      "no-var": "error", // var 사용 금지
      "no-unused-vars": "warn", // 안 쓰는 변수 경고

      // 코드 품질
      "no-console": ["warn", { allow: ["warn", "error"] }], // console.log 경고
      "no-debugger": "error", // debugger 금지

      // import 관련
      "no-duplicate-imports": "error", // 중복 import 금지
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
