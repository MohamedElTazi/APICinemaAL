import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createSalleValidation, listSalleValidation, salleIdValidation, sallePlanningValidation, updateSalleMaintenanceValidation, updateSalleValidation } from "../validators/salle-validator";
import { AppDataSource } from "../../database/database";
import { Salle } from "../../database/entities/salle";
import { SalleUsecase } from "../../domain/salle-usecase";
import { authMiddlewareAdmin, authMiddlewareAll} from "../middleware/auth-middleware";
import { toZonedTime } from "date-fns-tz";

export const SalleHandler = (app: express.Express) => {
   

    app.post("/salles",authMiddlewareAdmin ,async (req: Request, res: Response) => {
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

    app.get("/salles",authMiddlewareAll,async (req: Request, res: Response) => {
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


    app.get("/salles/planning/:id",authMiddlewareAll,async (req: Request, res: Response) => {

        const validationResultParams = salleIdValidation.validate(req.params)

        if (validationResultParams.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultParams.error.details))
            return
        }
        const salleId = validationResultParams.value

        const salleRepository = AppDataSource.getRepository(Salle)
        const salle = await salleRepository.findOneBy({ id: salleId.id })
        if (salle === null) {
            res.status(404).send({ "error": `salle ${salleId.id} not found` })
            return
        }
        
        let { startDate, endDate} = req.query;

        const validationResultQuery = sallePlanningValidation.validate(req.query)


        if (validationResultQuery.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultQuery.error.details))
            return
        }


        const salleUsecase = new SalleUsecase(AppDataSource);
        const query = await salleUsecase.getSallePlanning(startDate as string, endDate as string, salleId.id);

        if(query === null){
            res.status(404).send(Error("Error fetching planning"))
            return
        }   
        
        try {
            const planning = await query.orderBy("showtime.start_datetime", "ASC").getMany();
            planning.forEach((showtime) => {
                showtime.start_datetime = toZonedTime(showtime.start_datetime, '+04:00')
                showtime.end_datetime = toZonedTime(showtime.end_datetime, '+04:00')
            })
            res.status(200).send(planning);
        } catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });


    app.get("/salles/:id",authMiddlewareAll,async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value

            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ id: salleId.id })
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

    app.delete("/salles/:id",authMiddlewareAdmin ,async (req: Request, res: Response) => {
        try {
            const validationResult = salleIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const salleId = validationResult.value
    
            const salleRepository = AppDataSource.getRepository(Salle)
            const salle = await salleRepository.findOneBy({ id: salleId.id })
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` })
                return
            }
    
            await salleRepository.remove(salle)
            res.status(200).send(`Successfully deleted`)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.patch("/salles/:id",authMiddlewareAdmin ,async (req: Request, res: Response) => {

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


    app.patch("/salles/maintenance/:id",authMiddlewareAdmin, async (req: Request, res: Response) => {

        const validation = updateSalleMaintenanceValidation.validate({ ...req.params, ...req.body })
        
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        
        const updateSalleMaintenanceRequest = validation.value

        try {
            const salleUsecase = new SalleUsecase(AppDataSource);


            const updatedMaintenanceSalle = await salleUsecase.updateMaintenanceSalle(updateSalleMaintenanceRequest.id, updateSalleMaintenanceRequest )
            
            if (updatedMaintenanceSalle === null) {
                res.status(404).send({ "error": `Salle ${updateSalleMaintenanceRequest.id} not found` })
                return
            }


            res.status(200).send(updatedMaintenanceSalle)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

}