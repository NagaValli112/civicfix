const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const responseSchema = {
    description: "Civic issue analysis",
    type: SchemaType.OBJECT,
    properties: {
        category: {
            type: SchemaType.STRING,
        },
        issueType: {
            type: SchemaType.STRING,
        },
        severity: {
            type: SchemaType.STRING,
            enum: ["Low", "Medium", "High"],
        },
        description: {
            type: SchemaType.STRING,
        },
        impact: {
            type: SchemaType.STRING,
        },
        recommendation: {
            type: SchemaType.STRING,
        },
        confidence: {
            type: SchemaType.NUMBER,
        }
    },
    required: [
        "category",
        "issueType",
        "severity",
        "description",
        "impact",
        "recommendation",
        "confidence"
    ]
};

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction:
        "You are an expert civil engineer. Analyze civic issue images accurately.",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema
    }
});

async function analyzeIssue(imageBuffer, mimeType, userText = "") {

    try {

        const image = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType
            }
        };

        const prompt = `
Analyze this civic issue image.

User Description:
${userText || "None"}

Return JSON only.
`;

        const result = await model.generateContent([
            prompt,
            image
        ]);

        const response = result.response.text();

        return JSON.parse(response);

    } catch (err) {

        console.error("Gemini Error:", err);

        return {
            category: "General",
            issueType: "Unknown",
            severity: "Medium",
            description: "Unable to analyze image.",
            impact: "Manual inspection required.",
            recommendation: "Inspect manually.",
            confidence: 0
        };

    }

}

module.exports = {
    analyzeIssue
};