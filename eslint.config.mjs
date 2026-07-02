import * as espree from "espree"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import jsxA11y from "eslint-plugin-jsx-a11y"

const config = [
  ...nextCoreWebVitals,
  {
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    settings: {
      react: {
        version: "19",
      },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: espree,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {},
    },
  },
  {
    rules: {
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    ignores: [".material/**", "public/**"],
  },
]

export default config
