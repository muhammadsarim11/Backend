import AsyncHandler from "../utils/AsyncHandler.js";

const RegisterUser = AsyncHandler(async (req, res) => {
  res.status(200).json({
    message: "succes",
  });
});

export default RegisterUser;
