"use server";

import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { error: "לא סופק קובץ" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text using mammoth
    const { value: text } = await mammoth.extractRawText({ buffer });

    if (text.length < 50) {
      return { error: "הקובץ אינו מכיל מספיק טקסט לעיבוד." };
    }

    // Gemini Integration
    const apiKey = process.env.GEMINI_API_KEY;
    let flashcards = [];

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          generationConfig: {
            temperature: 0.8, // Increase randomness
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        });

        const prompt = `
          Analyze the following veterinary text deeply.
          Generate **30 to 50** high-quality flashcards in Hebrew.
          
          Cover the ENTIRE document, not just the beginning. 
          Vary the questions to include definitions, physiological values, symptoms, and treatments.
          
          Format the output as a JSON array of objects with 'id', 'question', and 'answer' keys.
          Example: [{"id": "1", "question": "...", "answer": "..."}]
          
          Ensure the questions are concise and the answers are accurate.
          DO NOT wrap the output in markdown code blocks. Just return the raw JSON array.
          
          Text:
          ${text.slice(0, 100000)} // Increased context limit
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();

        // Clean up markdown code blocks if present
        content = content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        // precise parsing to find the array
        const jsonStart = content.indexOf("[");
        const jsonEnd = content.lastIndexOf("]") + 1;

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = content.substring(jsonStart, jsonEnd);
          flashcards = JSON.parse(jsonString);

          // Ensure IDs are unique strings
          flashcards = flashcards.map((card: any, index: number) => ({
            ...card,
            id: `ai-${Date.now()}-${index}`,
          }));
        } else {
          console.error("Could not find JSON in Gemini response");
          // Fail silently to fallback, or could throw.
        }
      } catch (aiError) {
        console.error("Gemini Generation Error:", aiError);
      }
    }

    if (!flashcards || flashcards.length === 0) {
      // Mock Response for PoC (Fallback)
      flashcards = [
        {
          id: "1",
          question: "מהו קצב הלב התקין אצל חתול?",
          answer: "140-220 פעימות לדקה",
        },
        {
          id: "2",
          question: "מהו משך ההריון אצל כלבה?",
          answer: "63 ימים (טווח של 58-68 ימים)",
        },
        {
          id: "3",
          question: "ציין את העצב הגולגולתי האחראי על הבעות פנים.",
          answer: "עצב מס' 7 (Facial Nerve)",
        },
        {
          id: "4",
          question: "איזה טפיל גורם למחלת 'תולעת הלב'?",
          answer: "Dirofilaria immitis",
        },
        {
          id: "5",
          question: "מהי הטמפרטורה הרקטלית התקינה בכלב?",
          answer: "38.0 - 39.0 מעלות צלזיוס",
        },
      ];
    }

    return { flashcards };
  } catch (error) {
    console.error("Error processing file:", error);
    return { error: "Failed to process file" };
  }
}
