import OpenAI from "openai"
import { SectionObj } from "./splitMarkdown"

type EmbeddingVector = number[]
type EmbeddingResult = { index: number; embedding: EmbeddingVector }

const MODEL = "text-embedding-3-small" // or "text-embedding-ada-002"
const MAX_TOKENS_PER_REQUEST = 280_000 // keep under ~300k/server cap

// ~4 chars ≈ 1 token (rough, but good enough for batching)
const roughTokens = (s: string) => Math.ceil(s.length / 4)

// Batch so total tokens per request stay under the cap
function batchByTokens(inputs: string[]) {
  const batches: string[][] = []
  let current: string[] = []
  let sum = 0

  for (const text of inputs) {
    const tks = roughTokens(text)
    if (current.length && sum + tks > MAX_TOKENS_PER_REQUEST) {
      batches.push(current)
      current = []
      sum = 0
    }
    current.push(text)
    sum += tks
  }
  if (current.length) batches.push(current)
  return batches
}

export async function getSectionVectors(sections: SectionObj[] | SectionObj): Promise<EmbeddingResult[]> {
  const arr = Array.isArray(sections) ? sections : [sections]

  const inputs = arr.map(
    (o) => `${o.payload.theme} ${o.payload.course} ${o.payload.page} ${o.payload.text.replace(/\n/g, " ")}`
  )

  // returns EmbeddingResult[]
  return getEmbedding(inputs)
}

export async function getEmbedding(texts: string[] | string): Promise<EmbeddingResult[]> {
  const client = new OpenAI()
  const inputs = Array.isArray(texts) ? texts : [texts]

  const batches = batchByTokens(inputs)
  const out: EmbeddingResult[] = []

  for (const batch of batches) {
    const res = await client.embeddings.create({ model: MODEL, input: batch })
    for (const item of res.data) {
      out.push({ index: out.length, embedding: item.embedding })
    }
  }
  return out
}

export async function createSectionVector(sections: SectionObj[] | SectionObj): Promise<SectionObj[]> {
  const arr: SectionObj[] = Array.isArray(sections) ? sections : [sections]
  const vectors = await getSectionVectors(arr)

  if (arr.length !== vectors.length) {
    throw new Error(`Arrays do not have the same length: ${arr.length} vs ${vectors.length}`)
  }

  for (let i = 0; i < arr.length; i++) {
    arr[i].vector = vectors[i].embedding
  }
  return arr
}
