// Function to validate media size based on type
const validateMediaSize = (size, type) => {
    // Define your validation logic here
    // You can use type to determine specific size limits for each media type
    // For demonstration purposes, we'll assume a limit of 10MB for PDF files
    if (type === 'application/pdf') {
        return size <= 10 * 1024 * 1024; // 10MB in bytes
    }

    // Return true for other media types (assuming they are valid)
    return true;
};

// Function to get media size limits based on type
const mediaLimits = (type) => {
    // Define your media size limits based on type here
    // For demonstration purposes, we'll return a default limit
    return "10MB";
};

module.exports = { validateMediaSize, mediaLimits };
