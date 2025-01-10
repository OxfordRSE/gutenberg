// Make an object serializable to JSON.
//
// Useful to convert an object which may contain non-serializeable data such as
// Dates to an object that doesn't

function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return Object.fromEntries(value)
  } else {
    return value
  }
}

export function makeSerializable<T extends any>(o: T): T {
  return JSON.parse(JSON.stringify(o, replacer))
}

export function reduceRepeatingPatterns(inputString: string | null): string {
  // When the textcontent of a heading with latex symbols is convreted to a
  // string, any latex symbosls are triplicated. This detriplicates them.
  if (inputString === null) {
    return ""
  }
  // regex to replace any triplicated string fragments with the first instance
  return inputString.replace(/((\w{1,3}))\1{2}/g, "$1")
}

export function extractTextValues(node: any): string {
  // Extracts the text values from a markdown AST node to convert latex symbols
  // to text
  let result = [] as string[]
  if (node.type === "text") {
    result.push(node.value)
  } else if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      result = result.concat(extractTextValues(child))
    }
  }
  return result.join("")
}
