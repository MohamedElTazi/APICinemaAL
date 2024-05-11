"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateValidationErrorMessage = void 0;
const generateValidationErrorMessage = (errorDetails) => {
    const formattedErrors = {};
    errorDetails.forEach((detail) => {
        const key = detail.path.join(".");
        formattedErrors[key] = detail.message;
    });
    return formattedErrors;
};
exports.generateValidationErrorMessage = generateValidationErrorMessage;
