require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskController = require("./controllers/taskController");

const app = express();
app.use(cors());
app.use(express.json());


app.get("/api/tasks", taskController.getTasks);
app.post("/api/tasks", taskController.createTask);
app.put("/api/tasks/:id", taskController.updateTask);
app.delete("/api/tasks/:id", taskController.deleteTask);
app.post("/api/parse", taskController.parseVoiceInput);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));
