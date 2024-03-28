import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { createSalleValidation } from "./validators/salle-validator";
import { AppDataSource } from "../database/database";

export const initRoutes = (app: express.Express) => {
    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })




app.post("/salles", async (req: Request, res: Response) => {
    const validation = createSalleValidation.validate(req.body)

    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details))
        return
    }

    const productRequest = validation.value
    const productRepo = AppDataSource.getRepository(salle)
    try {

        const productCreated = await productRepo.save(
            productRequest
        )
        res.status(201).send(productCreated)
    } catch (error) {
        res.status(500).send({ error: "Internal error" })
    }
})

}

