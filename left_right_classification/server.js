import express from "express";
import cors from "cors";
import { PythonShell } from "python-shell";

const app = express();
app.use(express.json());
app.use(cors());

// Route to analyze article bias
app.post("/analyse", async (req, res) => {
    const { input_text } = req.body;
    if (!input_text) {
        return res.status(400).json({ error: "Text input is required" });
    }

    let options = {
        mode: "text",
        pythonOptions: ["-u"],
        scriptPath: new URL(".", import.meta.url).pathname.substring(3), // Get current directory
        args: [JSON.stringify({ input_text })],
    };

    // console.log(options.scriptPath)

    PythonShell.run("predict.py", options).then(results => {
        console.log("server.js: " + results[0])
        const response = JSON.parse(results[0]); // Parse JSON response from Python
        res.json(response);
    }).catch(err => {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
