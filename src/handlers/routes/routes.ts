import express, { Request, Response } from "express";
import { invalidPathHandler } from "../errors/invalid-path-handler";
import { UserHandler } from "./user";
import { SalleHandler } from "./salle";
import  {MovieHandler} from "./movie";
import { ShowtimeHandler } from "./showtime";
import { PosteHandler } from "./poste";
import { PlanningHandler } from "./planning";
import { EmployeeHandler } from "./employee";

export const initRoutes = (app: express.Express) => {

    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "OP LE S" })
    })


    UserHandler(app)
    SalleHandler(app)
    PosteHandler(app)
    MovieHandler(app)
    ShowtimeHandler(app)
    PlanningHandler(app)
    EmployeeHandler(app)

    app.use(invalidPathHandler);
}

