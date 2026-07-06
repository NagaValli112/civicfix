const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: "This is a test.",
    });

    console.log("SUCCESS!");
    console.log(response);
  } catch (err) {
    console.error("FAILED:");
    console.error(err);
  }
}

main();