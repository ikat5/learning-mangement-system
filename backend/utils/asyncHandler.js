const normalizeStatusCode = (error) => {
    const isValid = (code) => typeof code === "number" && code >= 100 && code < 600;

    if (isValid(error?.statusCode)) {
        return error.statusCode;
    }

    if (isValid(error?.status)) {
        return error.status;
    }

    if (Number(error?.code) === 11000) {
        return 409;
    }

    return 500;
};

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error("🔥 ASYNC HANDLER ERROR:", error);

        const statusCode = normalizeStatusCode(error);
        const message =
            Number(error?.code) === 11000
                ? "Duplicate record detected. Please try a different value."
                : error?.message || "Internal Server Error";

        res.status(statusCode).json({
            success: false,
            message
        });
    }
};
export { asyncHandler };
