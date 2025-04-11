import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
const RegisterUser = AsyncHandler(async (req, res) => {
  const { email, password, fullName, username } = req.body;
  console.log(email);

  if (!email || !password || !fullName || !username) {
    throw new ApiError("Please provide all required fields", 400);
  }

  const existeduser = User.find({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new ApiError("User already exists", 409);
  }

  const avatarpath = req.files?.avatar[0]?.path;
  console.log(avatarpath);

  if (!avatarpath) {
    throw new ApiError("Please provide an avatar", 400);
  }
  const coverImagepath = req.files?.coverimage[0]?.path;
  console.log(coverImagepath);

  const avatar = UploadOnCloudinary(avatarpath, "avatar");
  const coverImage = UploadOnCloudinary(coverImagepath, "coverimage");

  if (!avatar || !coverImage) {
    throw new ApiError("Error uploading images", 500);
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url,
    username: username.tolowerCase(),
    email,
    password,
  });
  console.log(user);

  const createduser = await user
    .findById(user._id)
    .select("-password -userrefreshToken -watchHistory");
  if (!createduser) {
    throw new ApiError("Error creating user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, res, "User created successfully"));
});

export default RegisterUser;
