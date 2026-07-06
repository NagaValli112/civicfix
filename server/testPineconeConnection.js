const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const testPinecone = async () => {
    try {
        console.log("Checking Pinecone API Key...");
        if (!process.env.PINECONE_API_KEY) {
            throw new Error("PINECONE_API_KEY not found in .env");
        }
        console.log("API Key found.");

        console.log("Initializing Pinecone...");
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

        const indexName = process.env.PINECONE_INDEX || 'civicfix';
        console.log(`Checking index: ${indexName}`);

        const index = pc.index(indexName);
        const description = await index.describeIndexStats();

        console.log("SUCCESS: Pinecone is connected!");
        console.log("Index Stats:", JSON.stringify(description, null, 2));

    } catch (error) {
        console.error("Pinecone Connection Failed!");
        console.error(error.message);
    }
};

testPinecone();
