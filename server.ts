import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large image uploads for receipt OCR
app.use(express.json({ limit: '25mb' }));

// Shared server-side Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// OCR Receipt Scanning Endpoint
app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Data gambar struk (imageBase64) tidak ditemukan.',
      });
    }

    // Strip data URL header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const ai = getAiClient();

    const promptText = `
You are an expert OCR receipt parser for the personal finance tracker "Montra".
Analyze this receipt photo carefully and extract the transaction details.

Task:
1. Identify the merchant or store name (e.g., Indomaret, Alfamart, Starbucks, McDonald's, SPBU Pertamina, Tokopedia, etc.).
2. Extract the GRAND TOTAL amount paid.
   - For Indonesian Rupiah (IDR), parse total as an integer (e.g., if receipt says "Total: Rp 65.500" or "65,500", output 65500).
   - If change or discount is shown, find the final total amount actually paid.
3. Extract the transaction date in YYYY-MM-DD format (e.g., 2026-10-13). If the year is ambiguous or missing, use 2026. If date is completely unreadable, leave as today's date format.
4. Classify the purchase into one of these exact expense categories:
   - "Food & Drinks" (restaurants, cafes, groceries, meals, snacks)
   - "Transportation" (fuel, bensin, taxi, Grab, Gojek, toll, train, MRT)
   - "Shopping" (clothing, electronics, general retail, personal care)
   - "Bills & Utilities" (electricity, water, phone, internet, Wi-Fi)
   - "Education" (books, tuition, courses)
   - "Health" (pharmacy, medicine, doctor, clinic)
   - "Entertainment" (movies, games, tickets)
   - "Housing" (rent, maintenance, furniture)
   - "Other Expenses"
5. Provide a short concise note or list of 2-3 key items bought.

Return only valid JSON matching the schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: {
              type: Type.STRING,
              description: 'Name of the store or merchant.',
            },
            amount: {
              type: Type.NUMBER,
              description: 'Total transaction amount paid as a positive number.',
            },
            date: {
              type: Type.STRING,
              description: 'Date in YYYY-MM-DD format.',
            },
            category: {
              type: Type.STRING,
              description: 'One of the predefined expense categories.',
            },
            notes: {
              type: Type.STRING,
              description: 'Short summary of items or invoice number.',
            },
          },
          required: ['merchant', 'amount', 'date', 'category'],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: {
        merchant: parsedData.merchant || 'Struk Belanja',
        amount: Math.round(Math.abs(Number(parsedData.amount) || 0)),
        date: parsedData.date || new Date().toISOString().split('T')[0],
        category: parsedData.category || 'Food & Drinks',
        notes: parsedData.notes || '',
      },
    });
  } catch (error: any) {
    console.error('OCR Receipt parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menganalisis struk dengan AI OCR.',
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Montra full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
