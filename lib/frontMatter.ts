import yaml from "js-yaml"

export type FrontMatterContent = {
  attributes: Record<string, unknown>
  body: string
  bodyBegin: number
  frontmatter?: string
}

const optionalByteOrderMark = "\\ufeff?"

// prettier-ignore
const frontMatterPattern =
  "^(" +
  optionalByteOrderMark +
  "(= yaml =|---)" +
  "$([\\s\\S]*?)" +
  "^(?:\\2|\\.\\.\\.)\\s*" +
  "$" +
  "(?:\\r?\\n)?)"

const frontMatterRegex = new RegExp(frontMatterPattern, "m")

function computeBodyBegin(matchIndex: number, matchLength: number, source: string): number {
  const offset = matchIndex + matchLength
  let line = 1

  for (let i = 0; i < source.length && i < offset; i += 1) {
    if (source[i] === "\n") {
      line += 1
    }
  }

  return line
}

export function parseFrontMatter(source: string): FrontMatterContent {
  const match = frontMatterRegex.exec(source)

  if (!match) {
    return {
      attributes: {},
      body: source,
      bodyBegin: 1,
    }
  }

  const frontmatter = match[match.length - 1].trim()
  const attributes = (yaml.load(frontmatter) as Record<string, unknown> | null) ?? {}

  return {
    attributes,
    body: source.replace(match[0], ""),
    bodyBegin: computeBodyBegin(match.index, match[0].length, source),
    frontmatter,
  }
}
