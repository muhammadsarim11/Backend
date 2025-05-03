import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { json } from "express";
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

  if (!(username || email || password || fullName)) {
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
  const { username, email, password } = req.body;

  if (!username && !email) {
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
    "-password -userrefreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // Use secure cookies in production
  };

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options) // Set refreshToken cookie
    .cookie("accessToken", accessToken, options) // Set accessToken cookie
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

const LogoutUser = AsyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict",
  };

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        userrefreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .clearCookie("accessToken", options) // Clear accessToken cookie
    .clearCookie("refreshToken", options) // Clear refreshToken cookie
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingToken = req.cookie.refreshToken;

  try {
    if (!incomingToken) {
      throw new ApiError("failed", 404);
    }

    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError("invalid refresh token request", 404);
    }

    if (incomingToken !== user?.userrefreshToken) {
      throw new ApiError("refresh token is expired", 400);
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessandRefreshToken(user._id);
    res
      .status(200)
      .cookie("accessToken", accessToken, options) // Set accessToken cookie
      .cookie("refreshToken", newrefreshToken, options) // Set refreshToken cookie
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    console.error("Error refreshing access token:", error); // Log the error for debugging
    throw new ApiError(500, "Internal server error"); // Throw a generic error
  }
});
const ChangePassword = AsyncHandler(async (req, res) => {
  const { newpassword, oldpassword } = req.body;
  const user = await User.findById(req.user._id);

  const ispasswordcorrect = await user.isPasswordMatch(oldpassword);

  if (!ispasswordcorrect) {
    throw new ApiError(400, "invalid info");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password is successfully changed!"));
});

const updateAccountDetails = AsyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "fill the information correclty!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }.select("-password")
  );

  return res
    .status(200)
    .json(ApiResponse(200, user, "Account details successfully changed!"));
});

const updateAvatar = AsyncHandler(async (req, res) => {
  const avatarlocalpath = req.file.path;
  if (!avatarlocalpath) {
    throw new ApiError(400, "File is missing!");
  }

  const avatar = await UploadOnCloudinary(avatarlocalpath);
  if (!avatar.url) {
    throw new ApiError(400, "error while uploading!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }.select("-password")
  );

  return res
    .status(200)
    .json(ApiResponse(200, user, "Avatar successfully changed!"));
});

const updateCoverImage = AsyncHandler(async (req, res) => {
  const coverImagelocalpath = req.file.path;

  if (!coverImagelocalpath) {
    throw new ApiError(400, "File is missing!");
  }

  const coverImage = await UploadOnCloudinary(coverImagelocalpath);

  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading coverimage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }.select("-password")
  );

  return res.status(200).json(200, user, "CoverImage is succesfully changed!");
});

export default RegisterUser;
export {
  LoginUser,
  LogoutUser,
  refreshAccessToken,
  ChangePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};
