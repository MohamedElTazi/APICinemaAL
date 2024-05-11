import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createPosteValidation, listPosteValidation, posteIdValidation , updatePosteValidation} from "../validators/poste-validator";
import { Poste } from "../../database/entities/poste";
import { PosteUsecase } from "../../domain/poste-usecase";
import { authMiddlewareAdmin } from "../middleware/auth-middleware";

export const PosteHandler = (app: express.Express) => {

    app.get("/postes/:id",  async (req: Request, res: Response) => {
        try {
            const validationResult = posteIdValidation.validate(req.params)
            if(validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const posteId = validationResult.value
            const posteRepository = AppDataSource.getRepository(Poste)
            const poste = await posteRepository.findOneBy({id: posteId.id})
            if(poste === null) {
                res.status(404).send({"error": `poste ${posteId.id} not found`})
                return
            }
            res.status(200).send(poste)
        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.get("/postes", async (req: Request, res: Response) => {
        const validation = listPosteValidation.validate(req.query)

        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listPosteRequest = validation.value
        let limit = 20
        if(listPosteRequest.limit) {
            limit = listPosteRequest.limit
        }
        const page = listPosteRequest.page ?? 1

        try {
            const posteUsecase = new PosteUsecase(AppDataSource)
            const listPostes = await posteUsecase.listPoste({...listPosteRequest, page, limit})
            res.status(200).send(listPostes)
        } catch(error) {
            console.log(error)
        }
    })

    app.post("/postes", async (req: Request, res: Response) => {
        const validation = createPosteValidation.validate(req.body)
        if(validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        const PosteRequest = validation.value
        const posteRepository = AppDataSource.getRepository(Poste)
        try{
            const posteCreated = await posteRepository.save(
                PosteRequest
            )
            res.status(201).send(posteCreated)

        }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.patch("/postes/:id", async (req: Request, res: Response) => {

            const validation = updatePosteValidation.validate({...req.params, ...req.body})

            if(validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details))
                return
            }

            const UpdatePosteRequest = validation.value



            try {
                const posteUsecase = new PosteUsecase(AppDataSource)

                const validationResult = posteIdValidation.validate(req.params)
            
                if(validationResult.error) {
                    res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                    return
                }
                const posteId = validationResult.value
    
                const updatedPoste = await posteUsecase.updatePoste(
                    UpdatePosteRequest.id,
                    { ...UpdatePosteRequest }
                )
                if(updatedPoste === null) {
                    res.status(404).send({"error": `Poste ${UpdatePosteRequest.id} not found`})
                    return
                }
        
        
        
                res.status(200).send(updatedPoste)
            }
        catch(error) {
            console.log(error)
            res.status(500).send({error: "Internal error"})
        }
    })

    app.delete("/postes/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = posteIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const posteId = validationResult.value
    
            const PosteRepository = AppDataSource.getRepository(Poste)
            const poste = await PosteRepository.findOneBy({ id: posteId.id })
            if (poste === null) {
                res.status(404).send({ "error": `salle ${posteId.id} not found` })
                return
            }
    
            const PosteDeleted = await PosteRepository.remove(poste)
            res.status(200).send(PosteDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

}