function createResponse(success, message, data = null) {
    return {
        success: success,
        message: message,
        data: data
    };
}

export default createResponse;
