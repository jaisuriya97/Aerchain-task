const Task = require("../models/Task");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.parseVoiceInput = async (req, res) => {
  const { transcript } = req.body;
  const now = new Date();
  const currentISO = now.toISOString().split("T")[0];
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

  console.log(`Gemini Processing: "${transcript}"`);

 

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "A short, actionable summary (5-8 words max)",
            },
            description: {
              type: SchemaType.STRING,
              description: "All remaining details, context, quotes, or notes",
            },
            priority: {
              type: SchemaType.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
            },
            status: {
              type: SchemaType.STRING,
              enum: ["To Do", "In Progress", "Done"],
            },
            dueDate: {
              type: SchemaType.STRING,
              description: "ISO 8601 date string (YYYY-MM-DD) or null",
            },
          },
          required: ["title", "priority", "status"],
        },
      },
    });

    const prompt = `
      You are an expert Project Manager AI.
      
      CONTEXT:
      - Today is: ${dayName}
      - Date is: ${currentISO}
      
      USER INPUT: "${transcript}"
      
      YOUR GOAL:
      1. Extract a concise **Title** (e.g., "Send Proposal" instead of "Remind me to send proposal").
      2. Move extra details into **Description**.
      3. Calculate relative dates (e.g., "next Friday") to exact YYYY-MM-DD.
      4. Infer Priority (Critical/High/Medium/Low).
      5. Default Status is "To Do".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    const parsedData = JSON.parse(jsonString);

    res.json(parsedData);
  } catch (err) {
    console.error("Failed:", err);
    res.status(500).json({
      error: "Parsing Failed",
      details: err.message,
    });
  }
};
