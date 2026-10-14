require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});