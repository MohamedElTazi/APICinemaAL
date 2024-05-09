import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createPlanningValidation, listPlanningValidation, planningIdValidation, updatePlanningValidation } from "../validators/planning-validator";
import { Planning } from "../../database/entities/planning";
import { PlanningUsecase } from "../../domain/planning-usecase";
import { authMiddlewareSuperAdmin } from "../middleware/auth-middleware";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const PlanningHandler = (app: express.Express) => {
    app.post("/plannings", authMiddlewareSuperAdmin, async (req: Request, res: Response) => {
        const reqBodyStartDatetime = req.body.start_datetime
        const reqBodyEndDatetime = req.body.end_datetime

        const validation = createPlanningValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }


        const planningRequest = validation.value

        const planningRepository = AppDataSource.getRepository(Planning)
        
        planningRequest.end_datetime = reqBodyEndDatetime

        planningRequest.start_datetime = reqBodyStartDatetime

        const planningUseCase = new PlanningUsecase(AppDataSource);

        const verifyPoste = await planningUseCase.verifyPoste( planningRequest.poste, planningRequest.start_datetime, planningRequest.end_datetime)

        console.log("ici**********",verifyPoste[0]['COUNT(*)'])

        if(verifyPoste[0]['COUNT(*)'] === "1"){
            res.status(404).send({ "error": `this poste is already take at this time` })
            return
        }

        try {

            const PlanningCreated = await planningRepository.save(
                planningRequest
            )
            res.status(201).send(PlanningCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/plannings", authMiddlewareSuperAdmin, async (req: Request, res: Response) => {
        const validation = listPlanningValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listPlanningRequest = validation.value
        let limit = 20
        if (listPlanningRequest.limit) {
            limit = listPlanningRequest.limit
        }
        const page = listPlanningRequest.page ?? 1

        const planningRepository = AppDataSource.getRepository(Planning)


        try {
            const planningUsecase = new PlanningUsecase(AppDataSource);
            const listPlanning = await planningUsecase.listPlanning({ ...listPlanningRequest, page, limit })
            res.status(200).send(listPlanning)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    
    app.get("/plannings/:id", authMiddlewareSuperAdmin, async (req: Request, res: Response) => {
        try {
            const validationResult = planningIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const planningId = validationResult.value

            const planningRepository = AppDataSource.getRepository(Planning)
            const planning = await planningRepository.findOneBy({ id: planningId.id })
            if (planning === null) {
                res.status(404).send({ "error": `planning ${planningId.id} not found` })
                return
            }
            res.status(200).send(planning)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.delete("/plannings/:id", authMiddlewareSuperAdmin, async (req: Request, res: Response) => {
        try {
            const validationResult = planningIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const planningId = validationResult.value
    
            const planningRepository = AppDataSource.getRepository(Planning)
            const planning = await planningRepository.findOneBy({ id: planningId.id })
            if (planning === null) {
                res.status(404).send({ "error": `planning ${planningId.id} not found` })
                return
            }
    
            await planningRepository.remove(planning)
            res.status(200).send(`Successfully deleted`)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.patch("/plannings/:id", authMiddlewareSuperAdmin, async (req: Request, res: Response) => {

        const validation = updatePlanningValidation.validate({ ...req.params, ...req.body })
        const reqBodyStartDatetime = req.body.start_datetime
        const reqBodyEndDatetime = req.body.end_datetime

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updatePlanningRequest = validation.value

        updatePlanningRequest.end_datetime = reqBodyEndDatetime

        updatePlanningRequest.start_datetime = reqBodyStartDatetime

        try {
            const planningUsecase = new PlanningUsecase(AppDataSource);

            const updatedPlanning = await planningUsecase.updatePlanning(updatePlanningRequest.id, { ...updatePlanningRequest })
            
            if (updatedPlanning === null) {
                res.status(404).send({ "error": `planning ${updatePlanningRequest.id} not found` })
                return
            }
            // START_DATETIME + END_DATETIME
            if (updatePlanningRequest.poste === undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined) {
                const verifyPoste = await planningUsecase.verifyPoste(updatedPlanning.poste, updatePlanningRequest.start_datetime, updatePlanningRequest.end_datetime)

                console.log("ici**********", verifyPoste[0]['COUNT(*)'], updatedPlanning.poste, updatePlanningRequest.start_datetime, updatePlanningRequest.end_datetime)

                if (verifyPoste[0]['COUNT(*)'] === "1") {
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
            }
            // POSTE + START_DATETIME + END_DATETIME
            if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatedPlanning.start_datetime, updatedPlanning.end_datetime)

                console.log("ici**********",verifyPoste[0]['COUNT(*)'], updatePlanningRequest.poste, updatePlanningRequest.start_datetime, updatePlanningRequest.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] === "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }
            // POSTE 
            if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime === undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatedPlanning.start_datetime, updatedPlanning.end_datetime)

                console.log("ici**********",verifyPoste[0]['COUNT(*)'], updatePlanningRequest.poste, updatedPlanning.start_datetime, updatedPlanning.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] === "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }
            // POSTE + END_DATETIME
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime !== undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatedPlanning.start_datetime, updatedPlanning.end_datetime)

                console.log("ici**********",verifyPoste[0]['COUNT(*)'], updatePlanningRequest.poste, updatedPlanning.start_datetime, updatePlanningRequest.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] === "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }
            //POSTE + START_DATETIME
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime === undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatedPlanning.start_datetime, updatedPlanning.end_datetime)

                console.log("ici**********",verifyPoste[0]['COUNT(*)'], updatePlanningRequest.poste, updatePlanningRequest.start_datetime, updatedPlanning.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] === "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }

            res.status(200).send(updatedPlanning)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

}