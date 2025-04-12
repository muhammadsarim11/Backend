import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessandRefreshToken = async (userId) => {
  // steps
  // 1. generate access token and refresh token
  // 2. save refresh token in database
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateToken();
    const refreshToken = user.refreshToken();
    user.userrefreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error); // Log the error for debugging
    throw new ApiError(500, "Internal server error"); // Throw a generic error
    // You can also choose to handle specific error cases here if needed
  }
};

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

const LoginUser = AsyncHandler(async (req, res) => {
  // re body -> data
  // username or email
  // find the user
  // password
  //access and refresh token
  // send cookies
  // send response
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "Please provide username or email");
  }
  if (!password) {
    throw new ApiError(400, "Please provide password");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ispasswordcorrect = await user.isPasswordMatch(password);
  if (!ispasswordcorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInuser = await User.findById(user._id).select(
    "-password -userrefreshToken "
  );

  const option = {
    httponly: true,
    secure: true,
  };

  res
    .status(200)
    .cookies("refreshToken", refreshToken, option)
    .cookies("generateToken", accessToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
export default RegisterUser;
