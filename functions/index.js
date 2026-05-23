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
