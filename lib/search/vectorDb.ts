
import {QdrantClient} from '@qdrant/js-client-rest';
import { type } from 'os';
import { MdPointOfSale } from 'react-icons/md';

const qdrantCollectionName = process.env.QDRANT_COLLECTION_NAME as string;
const qdrantDbUrl = "http://localhost:6333";

const client = new QdrantClient({url: qdrantDbUrl});

async function deleteIndex(qdrantCollection: string = qdrantCollectionName) {
    const response = await client.getCollections();
    const collectionNames = response.collections.map((collection) => collection.name);

    if (collectionNames.includes(qdrantCollection)) {
        await client.deleteCollection(qdrantCollection);
    }
}

async function createIndex(qdrantCollection: string = qdrantCollectionName) {

    const collect = await client.createCollection(qdrantCollection, {
            vectors: {
            size: 1536,
            distance: 'Cosine',
        },
        optimizers_config: {
            default_segment_number: 2,
        },
        replication_factor: 2,
    });
return collect
}

export async function jsonToIndex(json: any[]) {
    
    const ids = json.map(obj => obj.id);
    const vectors = json.map(obj => obj.vector);
    const payloads = json.map(obj => obj.payload);
    const testId = ids[45]

    await deleteIndex()
        .then(async () => {
            await createIndex()
        })
        .then(async () => {
            await client.upsert(qdrantCollectionName, {
                wait: true,
                batch: {ids:ids, vectors:vectors, payloads:payloads},
            });
        })
}
    
export async function searchVectors(vector: number[], k: number = 5) {
    const response = await client.search(qdrantCollectionName, { vector: vector, limit: k});
    console.log(response);
    return response;
}