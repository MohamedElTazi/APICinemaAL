"use strict";
// Fallback Middleware function for returning 
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidPathHandler = void 0;
// 404 error for undefined paths
const invalidPathHandler = (request, response, next) => {
    response.status(404);
    response.send({ "error": "path not found" });
    return;
};
exports.invalidPathHandler = invalidPathHandler;
