import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const RegisterUser = AsyncHandler(async (req, res) => {
  const { email, password, fullName, username } = req.body;

  if (!email || !password || !fullName || !username) {
    throw new ApiError("Please provide all required fields", 400);
  }

  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log("Existing User:", existeduser); // Debug log
  if (existeduser) {
    throw new ApiError("User already exists", 409);
  }

  const avatarpath = req.files?.avatar?.[0]?.path;
  const coverImagepath = req.files?.coverimage?.[0]?.path;

  console.log("Avatar Path:", avatarpath); // Debug log

  if (!avatarpath) {
    throw new ApiError("Please provide an avatar", 400);
  }
  if (!coverImagepath) {
    throw new ApiError("Please provide a cover image", 400);
  }

  const avatar = await UploadOnCloudinary(avatarpath, "avatar");

  const coverImage = await UploadOnCloudinary(coverImagepath, "coverimage");

  if (!avatar || !coverImage) {
    throw new ApiError("Error uploading images", 500);
  }

  const user = await User.create({
    fullName,
    avatar: avatar,
    coverImage: coverImage,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  const createduser = await User.findById(user._id)
    .lean()
    .select("-password -userrefreshToken -watchHistory");
  if (!createduser) {
    throw new ApiError("Error creating user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

export default RegisterUser;
