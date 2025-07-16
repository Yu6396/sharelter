require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.APP_PORT || 3000;
require("./config/db");
const userRoute = require("./src/routes/userRoute");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/docs/swaggerDef");
const bodyParser = require("body-parser");
const apartment_router = require("./src/routes/apartmentRoute");
const adminRoute = require("./src/routes/adminRoute");

app.use(bodyParser.json());
require("./src/utils/cron");
const path = require("path");

const cors = require("cors");

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, 
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/apartment", apartment_router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.send("Hello World!"));

app.use((req, res) => {
  res.status(404).send("Page not found");
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
