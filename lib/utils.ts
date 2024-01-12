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
