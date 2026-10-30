import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Name too long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password must be at least 6 characters"],
      select: false, // Prevents password from leaking in queries
    },
    refreshToken: {
      type: String,
      select: false, // Prevents refreshToken from leaking in queries
      default: null,
    },
    tokenVersion:{
      type:Number,
      default:0,
    }
  },
  { 
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);


// Compile schema into a model
const UserModel = mongoose.model('User', userSchema);

// Export the compiled Model so findOne, save, etc. work
export default UserModel;