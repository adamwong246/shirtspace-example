// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { flatConfigs } from "eslint-plugin-import";

const cycleDetector = flatConfigs.recommended;
cycleDetector.rules['import/no-cycle'] = "error";

const eslintConfig = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
)

export default eslintConfig;