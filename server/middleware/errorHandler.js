export const errorHandler = (err, req, res, next) => {
  console.log(`${req.method} ${req.path}`, err.message);

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  return res.status(status).json({ message });
};
