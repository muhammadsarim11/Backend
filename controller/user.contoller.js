import AsyncHandler from "../utils/AsyncHandler.js";

const RegisterUser = AsyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  console.log(email);
  res.status(200).json({
    // get user details
    // validation
    // check if user already exists
    // check for image
    // uplaod image to cloudinary
    // create user object - create entry in d
    // remove password and refresh token from user object
    // check for user creation
    // return response
    message: "User registered successfully",
    success: true,
  });
});

export default RegisterUser;
