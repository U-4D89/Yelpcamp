class ExpressError extends Error {
    constructor(message, statusCode, returnTo) {
        //call the error structure
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.returnTo = returnTo;
    }
    
}

module.exports = ExpressError;