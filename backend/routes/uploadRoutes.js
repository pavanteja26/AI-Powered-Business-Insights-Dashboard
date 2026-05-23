import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import * as xlsx from "xlsx";
import OpenAI from "openai";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Initialize OpenAI conditionally
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const generateMockInsights = (data) => {
  if (!data || data.length === 0) return "No data provided for insights.";
  
  // Try to find a numeric column to summarize
  let numericColumn = null;
  for (let key in data[0]) {
    if (!isNaN(parseFloat(data[0][key]))) {
      numericColumn = key;
      break;
    }
  }

  if (numericColumn) {
    const values = data.map(row => parseFloat(row[numericColumn])).filter(v => !isNaN(v));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return `Based on the uploaded data, we analyzed the '${numericColumn}' column. The maximum value observed is ${max.toFixed(2)}, while the minimum is ${min.toFixed(2)}. The average is approximately ${avg.toFixed(2)}. Consider focusing your marketing efforts on items performing above this average to maximize revenue!`;
  }

  return "We have successfully processed your data! Upload more numeric datasets to receive deeper insights such as performance averages and trend detections.";
};

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    
    let results = [];

    if (fileExt === 'csv') {
      results = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => data.push(row))
          .on("end", () => resolve(data))
          .on("error", reject);
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      results = xlsx.utils.sheet_to_json(sheet);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Only CSV and Excel files are supported" });
    }

    // Clean up file after parsing
    fs.unlinkSync(filePath);

    if (results.length === 0) {
      return res.status(400).json({ message: "The uploaded file is empty" });
    }

    const sampleData = results.slice(0, 20);
    let insight = "";

    if (openai) {
      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert data analyst. Analyze this data sample and give 2-3 sentences of highly actionable business insights. Focus on trends and actionable advice." },
            { role: "user", content: JSON.stringify(sampleData) }
          ]
        });
        insight = aiResponse.choices[0].message.content;
      } catch (err) {
        console.error("OpenAI Error:", err.message);
        insight = generateMockInsights(sampleData);
      }
    } else {
      insight = generateMockInsights(sampleData);
    }

    // Attempt to format data for charts (grab first category column and first numeric column)
    let categoryKey = null;
    let valueKey = null;

    if (results.length > 0) {
      const keys = Object.keys(results[0]);
      for (let key of keys) {
        const val = results[0][key];
        if (isNaN(parseFloat(val)) && !categoryKey) {
          categoryKey = key;
        } else if (!isNaN(parseFloat(val)) && !valueKey) {
          valueKey = key;
        }
      }
      
      // Fallbacks if not perfectly structured
      if (!categoryKey) categoryKey = keys[0];
      if (!valueKey) valueKey = keys[1] || keys[0];
    }

    const chartData = results.slice(0, 10).map(row => ({
      name: String(row[categoryKey] || 'Unknown').substring(0, 15),
      value: parseFloat(row[valueKey]) || 0
    }));

    res.json({
      totalRows: results.length,
      preview: sampleData,
      chartData: chartData,
      insight: insight,
      categoryKey,
      valueKey
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error processing file" });
  }
});

export default router;