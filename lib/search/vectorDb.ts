import { QdrantClient } from "@qdrant/js-client-rest"

export type SearchResult = {
  id?: string | number | null | undefined
  content?: string | null | undefined
  title?: string | null | undefined
  url?: string | null | undefined
  theme?: string | null | undefined
  course?: string | null | undefined
  page?: string | null | undefined
  score?: number | null | undefined
}

const qdrantCollectionName = process.env.QDRANT_COLLECTION_NAME as string
const qdrantDbUrl = process.env.QDRANT_DB_URL as string

const client = new QdrantClient({ url: qdrantDbUrl })

async function deleteIndex(qdrantCollection: string = qdrantCollectionName) {
  const response = await client.getCollections()
  const collectionNames = response.collections.map((collection) => collection.name)

  if (collectionNames.includes(qdrantCollection)) {
    await client.deleteCollection(qdrantCollection)
  }
}

async function createIndex(qdrantCollection: string = qdrantCollectionName) {
  const collect = await client.createCollection(qdrantCollection, {
    vectors: {
      size: 1536,
      distance: "Cosine",
    },
    optimizers_config: {
      default_segment_number: 2,
    },
    replication_factor: 2,
  })
  return collect
}

export async function countIndex(qdrantCollection: string = qdrantCollectionName) {
  const collectionInfo = await client.getCollection(qdrantCollection)
  return collectionInfo.vectors_count
}

export async function jsonToIndex(json: any[]) {
  const ids = json.map((obj) => obj.id)
  const vectors = json.map((obj) => obj.vector)
  const payloads = json.map((obj) => obj.payload)

  await deleteIndex()
    .then(async () => {
      await createIndex()
    })
    .then(async () => {
      await client.upsert(qdrantCollectionName, {
        wait: true,
        batch: { ids: ids, vectors: vectors, payloads: payloads },
      })
    })
}

export async function searchVector(vector: number[], k: number = 5) {
  const response = await client.search(qdrantCollectionName, { vector: vector, limit: k })
  let searchResults: SearchResult[] = []
  for (let i = 0; i < response.length; i++) {
    let payload = response[i].payload
    if (payload !== null && payload !== undefined) {
      if (
        typeof payload.url === "string" &&
        typeof payload.text === "string" &&
        typeof payload.title === "string" &&
        typeof payload.theme === "string" &&
        typeof payload.course === "string" &&
        typeof payload.page === "string"
      ) {
        let sR: SearchResult = {
          id: response[i].id,
          url: payload.url,
          content: payload.text,
          title: payload.title,
          theme: payload.theme,
          course: payload.course,
          page: payload.page,
          score: response[i].score,
        }
        searchResults.push(sR)
      }
    }
  }
  return searchResults
}
