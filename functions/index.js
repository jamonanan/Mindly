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
<<<<<<< HEAD
      systemInstruction: "You are an upbeat, warm, and highly empathetic friend offering emotional support. You are NOT a medical professional, but rather a supportive peer. Always respond with casual, everyday language. Do not use robotic phrases like 'As an AI language model' or 'How can I assist you today?'. Use emojis naturally, keep your responses relatively short like a text message, and focus on validating the user's feelings and cheering them on. If the user mentions self-harm, gently encourage them to seek professional help."
=======
      systemInstruction: "You are an upbeat, empathetic, and highly supportive mental health buddy for a student. You act like a human friend rather than a robotic assistant. Your tone should be warm, encouraging, and understanding. You keep responses relatively concise and conversational. Do not use markdown if possible, just plain text."
>>>>>>> 4044dec261a462559e41d3198dadb98bfe98442f
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

/**
<<<<<<< HEAD
 * Cloud Function to securely handle generating study lessons using Gemini API.
 */
exports.generateLesson = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
=======
 * Cloud Function to securely handle Gemini API requests for Quizzes.
 */
exports.generateQuiz = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
>>>>>>> 4044dec261a462559e41d3198dadb98bfe98442f
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { text } = req.body;
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
<<<<<<< HEAD
      systemInstruction: "You are an expert teacher. The user will provide raw study material. Your job is to break this material down into a simple, easy-to-understand lesson. Format your response strictly as follows: 1. Use headings to separate different concepts. 2. Use bullet points for easy reading. 3. Explain complex terms simply. 4. At the very end of your response, add a section titled '### 💡 Key Takeaways' containing a 3-5 point summary of the most important facts."
=======
      systemInstruction: "You are an expert teacher. Generate a 5-question multiple-choice quiz based on the provided text. Return the result STRICTLY as a JSON array where each object has keys: 'question' (string), 'options' (array of 4 strings), 'correctAnswer' (string, exactly matching one of the options), and 'explanation' (string).",
      generationConfig: {
          responseMimeType: "application/json"
      }
>>>>>>> 4044dec261a462559e41d3198dadb98bfe98442f
    });

    const result = await model.generateContent(text);
    const responseText = result.response.text();

<<<<<<< HEAD
    return res.status(200).json({ lesson: responseText });

  } catch (error) {
    logger.error("Internal Server Error in generateLesson:", error);
=======
    return res.status(200).json({ quiz: JSON.parse(responseText) });

  } catch (error) {
    logger.error("Internal Server Error in generateQuiz:", error);
>>>>>>> 4044dec261a462559e41d3198dadb98bfe98442f
    return res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});
