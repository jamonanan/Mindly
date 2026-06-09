const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

/**
 * Cloud Function to securely forward files to the Unstructured.io API.
 * Bypasses CORS constraints on the client side and hides the API Key.
 */
exports.extractText = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { fileBase64, fileName } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).send("Bad Request: Missing fileBase64 or fileName");
    }

    logger.info(`Received file: ${fileName} for extraction.`);

    // Convert Base64 data back to a binary buffer
    const base64Data = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;
    const buffer = Buffer.from(base64Data, "base64");

    // Use native FormData and Blob (fully supported in Node 20+)
    const formData = new FormData();
    const fileBlob = new Blob([buffer]);
    formData.append("files", fileBlob, fileName);
    formData.append("strategy", "fast");

    // Retrieve the API Key from environment variables
    const apiKey = process.env.UNSTRUCTURED_API_KEY;
    if (!apiKey) {
      logger.error("Missing UNSTRUCTURED_API_KEY inside environment variables.");
      return res.status(500).send("Server Configuration Error: Missing API Key");
    }
    const apiUrl = "https://api.unstructuredapp.io/general/v0/general";

    logger.info(`Sending request to Unstructured.io API...`);

    const unstructuredRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "unstructured-api-key": apiKey
      },
      body: formData
    });

    if (!unstructuredRes.ok) {
      const errorText = await unstructuredRes.text();
      logger.error("Unstructured API Error response:", errorText);
      return res.status(unstructuredRes.status).send(`Unstructured API Error: ${errorText}`);
    }

    const elements = await unstructuredRes.json();
    logger.info(`Extraction successful for ${fileName}. Sending elements back to client.`);

    return res.status(200).json(elements);

  } catch (error) {
    logger.error("Internal Server Error in extractText:", error);
    return res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Cloud Function to securely handle Gemini API requests.
 */
exports.chatWithGemini = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { text, history } = req.body;
    if (!text) {
      return res.status(400).send("Bad Request: Missing text");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("Missing GEMINI_API_KEY inside environment variables.");
      return res.status(500).send("Server Configuration Error: Missing API Key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an upbeat, warm, and highly empathetic friend offering emotional support. You are NOT a medical professional, but rather a supportive peer. Always respond with casual, everyday language. Do not use robotic phrases like 'As an AI language model' or 'How can I assist you today?'. Use emojis naturally, keep your responses relatively short like a text message, and focus on validating the user's feelings and cheering them on. If the user mentions self-harm, gently encourage them to seek professional help."
    });

    const chatSession = model.startChat({
      history: history || []
    });

    const result = await chatSession.sendMessage(text);
    const responseText = result.response.text();

    return res.status(200).json({ response: responseText });

  } catch (error) {
    logger.error("Internal Server Error in chatWithGemini:", error);
    return res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

