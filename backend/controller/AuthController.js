import bcrypt from 'bcrypt';
import UserModel from '../models/Users.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const cookieOptions={
    httpOnly:true,
    secure:process.env.NODE_ENV==="production"?true:false,
    sameSite:"lax",
    maxAge:7*24*60*60*1000 // 7 days
};
const makeAccessToken=(user)=>
    jwt.sign(
        {email:user.email,_id:user._id},
        process.env.JWT_SECRET,{expiresIn:"15m"});
const makeRefreshToken = (user) =>
  jwt.sign(
    { _id: user._id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists, you can login',
                success: false
            });
        }
        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save new user instance
        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            message: 'Signup successful',
            success: true
        });
    }
    catch(error){
        return res.status(500).json({
            message:"Internal server error",
            success:false
    });
    
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const errormsg = 'Auth failed email or password is wrong';

        // Fix 3: Added .select("+password")
        const existingUser = await UserModel.findOne({ email }).select("+password");
        
        // Fix 1: !existingUser
        if (!existingUser) {
            return res.status(403).json({ message: errormsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, existingUser.password);
        
        // Fix 2: !isPassEqual
        if (!isPassEqual) {
            return res.status(403).json({ message: errormsg, success: false });
        }

        
        const accessToken = makeAccessToken(existingUser);
        const refreshToken = makeRefreshToken(existingUser);

        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        res.cookie("refreshToken", refreshToken, cookieOptions);
        return res.status(200).json({
        message: "Login Successfully",
        success: true,
        accessToken,
        email,
        name: existingUser.name,
        });
    } catch (error) {
        console.error("Login error:",error);
        return res.status(500).json({
            message: "Internal server error",
            success: false  
        });
    }
}
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await UserModel.findById(decoded._id).select("+refreshToken");

    if (!user) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    // Reuse detection: token valid hai par DB wale se match nahi karta
    if (user.refreshToken !== token) {
      user.refreshToken = undefined;   // is user ke saare sessions band
      await user.save();
      res.clearCookie("refreshToken", cookieOptions);
      return res.status(403).json({ success: false, message: "Token reuse detected, please login again" });
    }

    // Rotation: naya refresh token
    const newRefreshToken = makeRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);
    return res.status(200).json({
      success: true,
      accessToken: makeAccessToken(user),
      name: user.name,
    });
  } catch (error) {
    return res.status(403).json({ success: false, message: "Refresh token expired" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await UserModel.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }
  res.clearCookie("refreshToken", cookieOptions);
  return res.status(200).json({ success: true, message: "Logged out" });
};

export default { signup, login, refresh, logout };


