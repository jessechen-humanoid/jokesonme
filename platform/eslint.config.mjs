import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    // 建置產物與 Cloudflare 本機暫存
    ".open-next/**",
    ".wrangler/**",
    // 原封不動沿用的舊應援匯入程式（見檔頭說明），不在這裡改寫風格
    "public/legacy/**",
  ]),
]);

export default eslintConfig;
