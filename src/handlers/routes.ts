import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { createSalleValidation, listSalleValidation, salleIdValidation, updateSalleValidation } from "./validators/salle-validator";
import { AppDataSource } from "../database/database";
import { Salle } from "../database/entities/salle";
import { SalleUsecase } from "../domain/-usecase";
import { not } from "joi";
import { invalidPathHandler } from "./errors/invalid-path-handler";
import { UserHandler } from "./user";

export const initRoutes = (app: express.Express) => {

    app.get("/health", (req: Request, res: Response) => {
        res.send({ "message": "hello world" })
    })


    app.post("/salles" ,async (req: Request, res: Response) => {
        console.log(UserHandler.name)
        const validation = createSalleValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const salleRequest = validation.value
        const salleRepo = AppDataSource.getRepository(Salle)
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

    app.get("/salles", async (req: Request, res: Response) => {
        const validation = listSalleValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listSalleRequest = validation.value
        let limit = 20
        if (listSalleRequest.limit) {
            limit = listSalleRequest.limit
        }
        const page = listSalleRequest.page ?? 1

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);
            const listSalles = await salleUsecase.listSalle({ ...listSalleRequest, page, limit })
            res.status(200).send(listSalles)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/salles/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value

            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ salle_id: salleId.id })
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` })
                return
            }
            res.status(200).send(salle)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.delete("/salles/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value
    
            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ salle_id: salleId.id })
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` })
                return
            }
    
            const salleDeleted = await salleRepository.remove(salle)
            res.status(200).send(`Successfully deleted`)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.patch("/salles/:id", async (req: Request, res: Response) => {

        const validation = updateSalleValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateSalleRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);

            if (updateSalleRequest.capacity === undefined || updateSalleRequest.capacity < 15 || updateSalleRequest.capacity > 30) {
                res.status(404).send("error: Capacity not good")
                return
            }

            const updatedSalle = await salleUsecase.updateSalle(updateSalleRequest.id, { ...updateSalleRequest })
            
            if (updatedSalle === null) {
                res.status(404).send({ "error": `Salle ${updateSalleRequest.id} not found` })
                return
            }



            res.status(200).send(updatedSalle)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })



    UserHandler(app)

    app.use(invalidPathHandler);
}

