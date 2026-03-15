// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";


export default [{
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "*.config.js",
    "*.config.mjs",
    "jest.config.js",
    "jest.setup.js",
    "next-env.d.ts",
    "docs/**",
  ],
}, {languageOptions: { globals: globals.browser }}, pluginJs.configs.recommended, ...tseslint.configs.recommended, pluginReactConfig, {
  rules: {
    "react/react-in-jsx-scope": "off",
  },
}, ...storybook.configs["flat/recommended"]];
