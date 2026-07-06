const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate embedding using Gemini
 */
console.log("generateEmbedding() called");
async function generateEmbedding(text) {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        return response.embeddings[0].values;
    } catch (err) {
        console.error("Embedding Error:", err.message);
        throw err;
    }
}

/**
 * Store ticket in Pinecone
 */
console.log("storeTicket() called");
async function storeTicket(ticket) {
    try {

        const text = `
Issue Type: ${ticket.aiAnalysis.issueType}
Category: ${ticket.aiAnalysis.category}
Severity: ${ticket.aiAnalysis.severity}
Description: ${ticket.aiAnalysis.description}
Location: ${ticket.location.address}
User Description: ${ticket.userDescription}
`;

        const embedding = await generateEmbedding(text);

        await index.upsert([
            {
                id: ticket._id.toString(),
                values: embedding,
                metadata: {
                    issueType: ticket.aiAnalysis.issueType,
                    category: ticket.aiAnalysis.category,
                    severity: ticket.aiAnalysis.severity,
                    status: ticket.status,
                    address: ticket.location.address
                }
            }
        ]);

        console.log("✅ Ticket stored in Pinecone");

    } catch (err) {

        console.error("Pinecone Upsert Error:", err.message);
console.log("Pinecone upsert successful");
    }
}

/**
 * Find duplicates
 */
async function findPotentialDuplicates(ticket) {

    try {

        const text = `
Issue Type: ${ticket.aiAnalysis.issueType}
Category: ${ticket.aiAnalysis.category}
Severity: ${ticket.aiAnalysis.severity}
Description: ${ticket.aiAnalysis.description}
Location: ${ticket.location.address}
`;

        const embedding = await generateEmbedding(text);

        const result = await index.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true
        });

        console.log("Pinecone Matches:", result.matches);
const duplicates = result.matches.filter(match => {

    if (match.score < 0.80) return false;

    return (
        match.metadata.issueType === ticket.aiAnalysis.issueType ||
        match.metadata.category === ticket.aiAnalysis.category
    );

});
        return duplicates;

    } catch (err) {

        console.error("Duplicate Search Error:", err.message);

        return [];

    }

}

/**
 * Delete ticket vector
 */
async function deleteTicket(id) {

    try {

        await index.deleteOne(id.toString());

        console.log("Vector deleted from Pinecone");

    } catch (err) {

        console.error(err.message);

    }

}

module.exports = {
    generateEmbedding,
    storeTicket,
    findPotentialDuplicates,
    deleteTicket
};