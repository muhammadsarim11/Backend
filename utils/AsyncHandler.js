const AsyncHandler = (RequestHandler) => async (req, res, next) => {
  try {
    await RequestHandler(req, res, next);
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

export default AsyncHandler;
