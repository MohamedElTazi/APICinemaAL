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

            const planning = await planningUsecase.foundPlanningById(updatePlanningRequest.id)
            
            if (planning === null) {
                res.status(404).send({ "error": `planning ${updatePlanningRequest.id} not found` })
                return
            }


            // START_DATETIME + END_DATETIME
            if (updatePlanningRequest.poste === undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined) {
                const verifyPoste = await planningUsecase.verifyPoste(planning.poste, updatePlanningRequest.start_datetime, updatePlanningRequest.end_datetime)

                if (verifyPoste[0]['COUNT(*)'] >= "1") {
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
            }


            // POSTE + START_DATETIME + END_DATETIME
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatePlanningRequest.start_datetime, updatePlanningRequest.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
            }


            // POSTE 
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime === undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, planning.start_datetime, planning.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }


            // POSTE + END_DATETIME
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime !== undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, planning.start_datetime, updatePlanningRequest.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }


            //POSTE + START_DATETIME
            else if(updatePlanningRequest.poste !== undefined &&  updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime === undefined){
                const verifyPoste = await planningUsecase.verifyPoste( updatePlanningRequest.poste, updatePlanningRequest.start_datetime, planning.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }

            // START_DATETIME
            else if(updatePlanningRequest.poste === undefined &&  updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime === undefined){
                const verifyPoste = await planningUsecase.verifyPoste( planning.poste, updatePlanningRequest.start_datetime, planning.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }

            // END_DATETIME
            else if(updatePlanningRequest.poste === undefined &&  updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime !== undefined){
                const verifyPoste = await planningUsecase.verifyPoste( planning.poste, planning.start_datetime, updatePlanningRequest.end_datetime)
        
                if(verifyPoste[0]['COUNT(*)'] >= "1"){
                    res.status(404).send({ "error": `this poste is already take at this time` })
                    return
                }
    
            }

            const updatedPlanning = await planningUsecase.updatePlanning(updatePlanningRequest.id, { ...updatePlanningRequest })

            res.status(200).send(updatedPlanning)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

}
/**
 * @openapi
 * components:
 *   schemas:
 *     Planning:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         employee:
 *           type: integer
 *         poste:
 *           type: integer
 *         start_datetime:
 *           type: string
 *           format: date-time
 *         end_datetime:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * tags:
 *   name: Planning
 *   description: Endpoints related to employee planning
 */

/**
 * @openapi
 * /plannings:
 *   post:
 *     tags: [Planning]
 *     summary: Create a new planning
 *     description: Create a new planning.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planning'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @openapi
 * /plannings:
 *   get:
 *     tags: [Planning]
 *     summary: Get all plannings
 *     description: Retrieve a list of all plannings.
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Planning'
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @openapi
 * /plannings/{id}:
 *   get:
 *     tags: [Planning]
 *     summary: Get a planning by ID
 *     description: Retrieve a planning with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the planning to get
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @openapi
 * /plannings/{id}:
 *   delete:
 *     tags: [Planning]
 *     summary: Delete a planning by ID
 *     description: Delete a planning with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the planning to delete
 *     responses:
 *       '200':
 *         description: Success
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */

/**
 * @openapi
 * /plannings/{id}:
 *   patch:
 *     tags: [Planning]
 *     summary: Update a planning by ID
 *     description: Update a planning with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the planning to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Planning'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Planning'
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */
