import OpenAIApi from "openai"
import { SectionObj, parsePages } from "./splitMarkdown"

const openaiEmbeddingModel = "text-embedding-ada-002"

export async function getSectionVectors(sections: SectionObj[] | SectionObj) {
  // if sections is not an array, make it an array
  if (!Array.isArray(sections)) {
    sections = [sections]
  }
  // remove /n from the text, before we send it to openai
  let text = sections.map(
    (obj) =>
      obj.payload.theme + " " + obj.payload.course + " " + obj.payload.page + " " + obj.payload.text.replace(/\n/g, " ")
  )
  const vectors = await getEmbedding(text)
  return vectors.data
}

export async function getEmbedding(text: string[] | string) {
  const openai = new OpenAIApi()
  const responsePromise = openai.embeddings.create({
    // add all the text params to a list to query openai
    input: text,
    model: openaiEmbeddingModel,
  })
  return await responsePromise
}

export async function createSectionVector(sections: SectionObj[] | SectionObj) {
  if (!Array.isArray(sections)) {
    sections = [sections]
  }
  const vectors = await getSectionVectors(sections)
  if (sections.length === vectors.length) {
    for (let i = 0; i < sections.length; i++) {
      sections[i].vector = vectors[i].embedding
    }
  } else {
    console.error("Arrays do not have the same length.")
  }
  return sections
}
