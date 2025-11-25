const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        console.error("🔥 ASYNC HANDLER ERROR:", error); // <-- ADD THIS

        res.status(error.code || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
export { asyncHandler };
