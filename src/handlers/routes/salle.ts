import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createSalleValidation, listSalleValidation, salleIdValidation, sallePlanningValidation, updateSalleMaintenanceValidation, updateSalleValidation } from "../validators/salle-validator";
import { AppDataSource } from "../../database/database";
import { Salle } from "../../database/entities/salle";
import { SalleUsecase } from "../../domain/salle-usecase";
import { authMiddlewareAdmin, authMiddlewareAll, authMiddlewareSuperAdmin, authMiddlewareUser} from "../middleware/auth-middleware";
import { toZonedTime } from "date-fns-tz";
import { UserHandler } from "./user";

export const SalleHandler = (app: express.Express) => {
   

    app.post("/salles",authMiddlewareAdmin ,async (req: Request, res: Response) => {
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
        
        const { startDate, endDate} = req.query;



        const validationResultQuery = sallePlanningValidation.validate(req.query)


        if (validationResultQuery.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultQuery.error.details))
            return
        }



        const salleUsecase = new SalleUsecase(AppDataSource);
        
        const query = await salleUsecase.getSallePlanning(startDate as string, endDate as string, salleId.id);
        if (query === null) {
            res.status(404).send({ "error": `salle ${salleId.id} not found` })
            return
        }

        try {
            const planning = await query.orderBy("showtime.date", "ASC").getMany();

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

/**
 * @openapi
 * components:
 *  schemas:
 *   salle:
 *    type: object
 *    properties:
 *     id:
 *      type: integer
 *      description: The auto-generated id of the salle.
 *     name:
 *      type: string
 *      description: The name of the salle.
 *     capacity:
 *      type: integer
 *      description: The capacity of the salle.
 * 
 * tags: 
 *  name: salles
 *  description: The salles managing API
 */


/**
 * @openapi
 * /salles:
 *   post:
 *     tags:
 *      [salles]
 *     summary: Create a new salle
 *     description: Create a new salle with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/salle'
 *     responses:
 *       201:
 *         description: salle created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'
 *       400:
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
/**
 * @openapi
 * /salles:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get all salles
 *     description: Retrieve a list of salles.
 *     responses:
 *       200:
 *         description: List of salles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/salle'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
/** 
 * @openapi
 * /salles/planning/{id}:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get salle planning by ID
 *     description: Retrieve the planning of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to retrieve the planning for.
 *     responses:
 *       200:
 *         description: Success retrieving the salle planning.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/sallePlanning'
 *       400:
 *         description: Invalid request or parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
/**
 * @openapi
 * /salles/{id}:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get a salle by ID
 *     description: Retrieve details of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to retrieve.
 *     responses:
 *       200:
 *         description: Success retrieving the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'
 *       400:
 *         description: Invalid request or parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
/**
 * @openapi
 * /salles/{id}:
 *   delete:
 *     tags:
 *      [salles]
 *     summary: Delete a salle by ID
 *     description: Delete a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to delete.
 *     responses:
 *       200:
 *         description: Success deleting the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'

 *       400:
 *         description: Invalid parameter or request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
/**
 * @openapi
 * /salles/maintenance/{id}:
 *   patch:
 *     tags:
 *      [salles]
 *     summary: Update maintenance information of a salle by ID
 *     description: Update the maintenance details of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to update maintenance information for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/salleMaintenance'
 *     responses:
 *       200:
 *         description: Success updating the maintenance information of the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salleMaintenance'
 *       400:
 *         description: Invalid parameter or request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */