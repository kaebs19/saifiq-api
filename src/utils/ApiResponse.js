class ApiResponse {
  static success(res, data, message = '', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null,
    });
  }

  static error(res, message, statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors,
    });
  }

  static paginated(res, data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message: '',
      data,
      errors: null,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
