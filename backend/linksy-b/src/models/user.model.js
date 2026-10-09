import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    paswordHash: {
      type: String,
      select: false, //do not return the password hash when querying the user
      required: function () {
        return this.authProvider == "local"; //if the user is using local auth, passwordHash is required
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },
    googleId: {
      type: String,
      sparse: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
      maxlength: 2048,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disable the __v field
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();

        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.googleId;
        return ret;
      },
    },
  },
);

userSchema.index({ username: 1 });
const User = mongoose.model("User", userSchema);

export default User;
