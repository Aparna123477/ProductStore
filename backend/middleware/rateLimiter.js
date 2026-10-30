// middleware/rateLimiter.js
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const identifier = req.ip || "anonymous";
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return res.status(429).json({ message: "Too many requests, please try again later" });
    }
    next();
  } catch (error) {
    console.error("Rate limit error", error);
    next(); // Redis fail ho to bhi request chalne do
  }
};

export default rateLimiter;