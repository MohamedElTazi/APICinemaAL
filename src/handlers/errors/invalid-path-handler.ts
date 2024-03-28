// Fallback Middleware function for returning 

import { NextFunction, Request, Response } from "express"

// 404 error for undefined paths
export const invalidPathHandler = (
    request: Request,
    response: Response,
    next: NextFunction) => {
    response.status(404)
    response.send({ "error": "path not found" })
    return
}