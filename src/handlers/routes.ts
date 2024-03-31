import express, { Request, Response } from "express";
import { invalidPathHandler } from "./errors/invalid-path-handler";
import { UserHandler } from "./user";
import { SalleHandler } from "./salle";

export const initRoutes = (app: express.Express) => {

    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })


    UserHandler(app)
    SalleHandler(app)

    app.use(invalidPathHandler);
}

