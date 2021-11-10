class ExpressError extends Error {
    constructor(message, statusCode) {
        //call the error structure
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;