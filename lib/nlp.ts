/**
 * Natural Language Processing utilities using wink-nlp
 * @type {module}
 */
import winkNLP, { Bow } from "wink-nlp"
import model from "wink-eng-lite-web-model"
import similarity from "wink-nlp/utilities/similarity"

const nlp = winkNLP(model)
const its = nlp.its
const as = nlp.as

/**
 * Tokenizes the input text and returns its Bag of Words (Bow) representation.
 * @param text
 * @returns Bow
 */
export function tokenizeText(text: string): Bow {
  const tokens = nlp
    .readDoc(text)
    .tokens()
    .filter((t) => t.out(its.type) === "word" && !t.out(its.stopWordFlag))
  return tokens.out(its.value, as.bow) as Bow
}

/**
 * Computes the cosine similarity between two Bag of Words (Bow) representations.
 * @param bowA
 * @param bowB
 * @returns number
 */
export function computeSimilarity(bowA: Bow, bowB: Bow): number {
  return similarity.bow.cosine(bowA, bowB)
}
