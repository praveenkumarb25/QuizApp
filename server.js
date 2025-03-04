import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize Redis Client
const redisClient = createClient();
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

await redisClient.connect();
console.log("✅ Connected to Redis");

// Topics and difficulty levels
const topics = ["General Knowledge", "Science", "History", "Technology", "Literature", "Math", "Geography"];
const difficulties = ["easy", "medium", "hard"];

// Function to generate diverse MCQ questions
async function generateQuestions() {
  try {
    // 🎯 Randomly select a topic & difficulty
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const prompt = `Generate a diverse quiz with 5 multiple-choice questions on ${topic}.
    Ensure difficulty levels include a mix of:
    - Easy, Medium, Hard
    - Fact-based, Concept-based, Problem-solving, Logical Reasoning
    - Variety in topics (General Knowledge, Science, History, Technology, Literature, Math, Geography)
    Return a JSON array with strict format:
    [{"question": "string", "options": ["string", "string", "string", "string"], "answer": "string"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    const cleanedText = textResponse.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleanedText);

    if (Array.isArray(questions)) {
      for (const q of questions) {
        const exists = await redisClient.sIsMember("questions_cache", q.question);
        if (!exists) {
          await redisClient.sAdd("questions_cache", q.question);
          await redisClient.rPush("questions_list", JSON.stringify(q));
          console.log(`✅ Stored Unique Question (${topic} - ${difficulty}): ${q.question}`);
        } else {
          console.log(`♻️ Skipped Duplicate: ${q.question}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error Generating Questions:", error);
  }
}

// Automatically generate new questions every 2 seconds
setInterval(generateQuestions, 2000);

// API route to fetch unique questions
app.post("/api/get-questions", async (req, res) => {
  const count = 5; // Return 5 unique questions
  const questions = [];

  for (let i = 0; i < count; i++) {
    const question = await redisClient.lPop("questions_list"); // Get a question from the queue
    if (question) {
      questions.push(JSON.parse(question));
    } else {
      break; // Stop if no more questions are available
    }
  }

  res.json(questions);
  console.log(`📤 Sent ${questions.length} questions to client.`);
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
