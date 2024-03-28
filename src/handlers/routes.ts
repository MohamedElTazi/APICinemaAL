import express, { Request, Response } from "express";

export const initRoutes = (app: express.Express) => {
    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })
}
