const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    const formData = req.body;
    if (formData.honeypot) {
      console.log("Honeypot dectected:", formData);
      return res.sendStatus(403);
    }

    if (!formData.fields || !Array.isArray(formData.fields)) {
      throw new Error("Invalid form data");
    }

    const response = {
      success: true,
      message: "Form submitted successfully",
      data: {
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
