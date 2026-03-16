import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/gating": "off",
      "react-hooks/globals": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
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
