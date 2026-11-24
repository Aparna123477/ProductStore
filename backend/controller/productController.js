import mongoose from "mongoose";
import Product from "../models/product.js";
import { generateProductDescription, parseSearchQuery, shoppingAssistant,findSimilarProducts } from "../services/ai.services.js";
export const getProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		console.log("error in fetching products:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const createProduct = async (req, res) => {
	const product = req.body; // user will send this data

	if (!product.name || !product.price || !product.image) {
		return res.status(400).json({ success: false, message: "Please provide all fields" });
	}

	const newProduct = new Product(product);

	try {
		await newProduct.save();
		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error("Error in Create product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const updateProduct = async (req, res) => {
	const { id } = req.params;

	const product = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
		res.status(200).json({ success: true, data: updatedProduct });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
export const deleteProduct = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		await Product.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Product deleted" });
	} catch (error) {
		console.log("error in deleting product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};


export const aiDescription = async (req, res) => {
	const name = (req.body.name || "").trim();
	const notes = (req.body.notes || "").trim();

	if (!name) {
		return res.status(400).json({ success: false, message: "Product name is required" });
	}
	if (name.length > 100 || notes.length > 1000) {
		return res.status(400).json({ success: false, message: "Input too long" });
	}

	try {
		const description = await generateProductDescription({ name, notes });
		if (!description) {
			return res.status(502).json({ success: false, message: "AI returned empty response" });
		}
		res.status(200).json({ success: true, description });
	} catch (error) {
		console.error("AI error:", error);
		const status = error.status === 429 ? 429 : error.status === 503 ? 503 : 500;
const messages = {
	429: "AI limit reached, try again in a minute",
	503: "AI is busy right now, please try again in a few seconds",
	500: "Assistant failed",
};
res.status(status).json({ success: false, message: messages[status] });
	}
};

export const assistantChat = async (req, res) => {
	const message = (req.body.message || "").trim();
	if (!message) return res.status(400).json({ success: false, message: "Message is required" });
	if (message.length > 500) return res.status(400).json({ success: false, message: "Message too long" });

	const history = (Array.isArray(req.body.history) ? req.body.history : [])
		.filter((h) => h && typeof h.text === "string" && ["user", "assistant"].includes(h.role))
		.slice(-6)
		.map((h) => ({ role: h.role, text: h.text.slice(0, 500) }));

	try {
		const products = await Product.find({})
			.select("name price description image")   // <- image yahan zaroori hai
			.sort({ createdAt: -1 })
			.limit(100)
			.lean();

		if (products.length === 0) {
			return res.status(200).json({ success: true, reply: "The store has no products yet.", products: [] });
		}

		const ai = await shoppingAssistant({ message, history, products });

		const byId = new Map(products.map((p) => [String(p._id), p]));
		const picked = (Array.isArray(ai.productIds) ? ai.productIds : [])
			.map((id) => byId.get(String(id)))
			.filter(Boolean)
			.slice(0, 4);

		res.status(200).json({ success: true, reply: ai.reply, products: picked });
	} catch (error) {
		console.error("Assistant error:", error);
		const isNetworkError = error.cause?.code === "UND_ERR_CONNECT_TIMEOUT" || error.message === "fetch failed";
		const status = isNetworkError ? 503 : error.status === 429 ? 429 : error.status === 503 ? 503 : 500;
		const messages = {
			429: "AI limit reached, try again in a minute",
			503: isNetworkError
				? "Cannot reach the AI service. Check your internet connection and try again"
				: "AI is busy right now, please try again in a few seconds",
			500: "Assistant failed",
		};
		res.status(status).json({ success: false, message: messages[status] });
	}
};
export const getProductById = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const product = await Product.findById(id);
		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}
		res.status(200).json({ success: true, data: product });
	} catch (error) {
		console.error("Error fetching product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
const similarCache = new Map(); // productId -> { ids, at }
const SIMILAR_TTL = 10 * 60 * 1000;

export const getSimilarProducts = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product Id" });
	}

	try {
		const product = await Product.findById(id).lean();
		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		const others = await Product.find({ _id: { $ne: id } })
			.select("name price description image")
			.sort({ createdAt: -1 })
			.limit(100)
			.lean();

		if (others.length === 0) {
			return res.status(200).json({ success: true, data: [] });
		}

		const byId = new Map(others.map((p) => [String(p._id), p]));
		let ids;

		const cached = similarCache.get(id);
		if (cached && Date.now() - cached.at < SIMILAR_TTL) {
			ids = cached.ids;
		} else {
			try {
				ids = await findSimilarProducts({ product, products: others });
				similarCache.set(id, { ids, at: Date.now() });
			} catch (error) {
				// AI fail ho to price ke closeness se fallback
				console.error("Similar AI failed, using fallback:", error.message);
				ids = [...others]
					.sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
					.slice(0, 4)
					.map((p) => String(p._id));
			}
		}

		const similar = (Array.isArray(ids) ? ids : [])
			.map((pid) => byId.get(String(pid)))
			.filter(Boolean)
			.slice(0, 4);

		res.status(200).json({ success: true, data: similar });
	} catch (error) {
		console.error("Similar products error:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
