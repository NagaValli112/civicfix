require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
    try {
        console.log("Checking API Key...");
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not found in .env");
        }
        console.log("API Key found (length: " + process.env.GEMINI_API_KEY.length + ")");

        console.log("Initializing Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTest = ["gemini-2.5-flash", "gemini-2.0-flash"];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                // Try forcing v1beta
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} responded: ${response.text()}`);
                break; // Stop on first success
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message.split(']')[1] || e.message}`);
            }
        }
    } catch (error) {
        console.error("Test Failed!");
        console.error(error);
    }
}

testConnection();
