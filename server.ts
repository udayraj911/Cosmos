import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Server-side chat completion proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { message, systemInstruction } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message content is required" });
      return;
    }

    const defaultInstruction = 
      "You are J.A.R.V.I.S., a helpful, highly intelligent, and direct AI space station virtual companion for a cosmos explorer. " +
      "Use refined technical language, call the user 'Commander', and keep answers relatively concise (~100-150 words) unless detailed scientific reports are asked.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction || defaultInstruction,
        temperature: 0.85,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini server error:", error);
    res.status(500).json({ error: error.message || "Failure contacting AI Core." });
  }
});

// Vite middleware for development, or static hosting for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cosmic Core server running successfully on http://localhost:${PORT}`);
  });
}

setupVite().catch((error) => {
  console.error("Fatal Server Bootstrap Failure:", error);
});
