import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { createSalleValidation } from "./validators/salle-validator";
import { AppDataSource } from "../database/database";
import { Salles } from "../database/entities/salle";

export const initRoutes = (app: express.Express) => {

    process.on('SIGINT', () => {
        AppDataSource.destroy().then(() => {
            console.log("Data Source has been closed!");
            process.exit();
        });
    });
    AppDataSource.initialize().then(() => {
        console.log("Data Source has been initialized!");
    }).catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
    

    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })




app.post("/salle", async (req: Request, res: Response) => {
    const validation = createSalleValidation.validate(req.body)

    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details))
        return
    }

    const salleRequest = validation.value
    const salleRepo = AppDataSource.getRepository(Salles)
    console.log("ok")
    try {

        const salleCreated = await salleRepo.save(
            salleRequest
        )
        res.status(201).send(salleCreated)
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal error" })
    }
})

}

