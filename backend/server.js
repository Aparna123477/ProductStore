import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import productRoutes from "./routes/product-routes.js";
import AuthRouter from "./routes/AuthRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

//this middleware of giving json :bodies
app.use(express.json()); // allows us to accept JSON data in the req.body
app.use(cookieParser());

app.use(rateLimiter);


app.use("/api/auth", AuthRouter);
app.use("/api/products", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("/{*splat}", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	connectDB();
	console.log("Server started at http://localhost:" + PORT);
});