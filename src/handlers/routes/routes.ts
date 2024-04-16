import express, { Request, Response } from "express";
import { invalidPathHandler } from "../errors/invalid-path-handler";
import { UserHandler } from "./user";
import { SalleHandler } from "./salle";
import { ShowtimeHandler } from "./showtime";

export const initRoutes = (app: express.Express) => {

    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "OP LE S" })
    })


    UserHandler(app)
    SalleHandler(app)
    ShowtimeHandler(app)

    app.use(invalidPathHandler);
}

