// Declare Prism lucario theme missing from @types/react-syntax-highlighter
declare module "react-syntax-highlighter/dist/cjs/styles/prism" {
  export { default as lucario } from "react-syntax-highlighter/dist/cjs/styles/prism/lucario"
}

declare module "react-syntax-highlighter/dist/cjs/styles/prism/lucario" {
  const style: any
  export default style
}
