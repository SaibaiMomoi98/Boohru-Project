const errorHandler = (err, req, res, next) => {
  let statusCode = 500; 
  let message = "An unexpected error occurred";
  if (err.code) {
    switch (err.code) {
      case 404:
        statusCode = 404;
        message = "Resource not found";
        break;
      case 500:
        statusCode = 500;
        message = "Internal server error";
        break;
      // Add more cases as needed
      default:
        message = "An unexpected error occurred";
    }
  }

  return {messsage: message, status: statusCode};
};

export default errorHandler;
