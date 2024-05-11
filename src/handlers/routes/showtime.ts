import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createShowtimeValidation, listShowtimeValidation, showtimeIdValidation, showtimePlanningValidation, updateShowtimeValidation,  } from "../validators/showtime-validator";
import { AppDataSource } from "../../database/database";
import { Showtime } from "../../database/entities/showtime";
import { ShowtimeUsecase } from "../../domain/showtime-usecase";
import { authMiddlewareAdmin, authMiddlewareAll, authMiddlewareUser } from "../middleware/auth-middleware";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Planning } from "../../database/entities/planning";
import { PlanningUsecase } from "../../domain/planning-usecase";


export const ShowtimeHandler = (app: express.Express) => {

    
    app.post("/showtimes",authMiddlewareAdmin ,async (req: Request, res: Response) => {
        const reqBodyStartDatetime = req.body.start_datetime
        req.body.start_datetime = req.body.start_datetime+"Z"

        const validation = createShowtimeValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }


        const showtimeRequest = validation.value

        const showtimeRepository = AppDataSource.getRepository(Showtime)

        const showtimeUsecase = new ShowtimeUsecase(AppDataSource);

        const end_datetime = await showtimeUsecase.getMovieDuration(req.body.movie, req.body.start_datetime)

        if (end_datetime === null) {
            res.status(404).send({ "error": `movie ${showtimeRequest.movie.id} not found` })
            return
        }

        const utcDate = toZonedTime(end_datetime, 'UTC');

        const formattedDatetime = format(utcDate, "yyyy-MM-dd'T'HH:mm:ss");

        req.body.end_datetime = formattedDatetime
        
        showtimeRequest.end_datetime = req.body.end_datetime

        showtimeRequest.start_datetime = reqBodyStartDatetime

        if(await showtimeUsecase.isOverlap(showtimeRequest)){
            res.status(404).send({ "error": `New showtime is overlap with other showtime` })
            return  
        }

        const planningUseCase = new PlanningUsecase(AppDataSource);

        const verifyPlanning = await planningUseCase.verifyPlanning(showtimeRequest.start_datetime, showtimeRequest.end_datetime)

        console.log("ici**********",verifyPlanning[0].postesCouverts)

        if(verifyPlanning[0].postesCouverts !== "3"){
            res.status(404).send({ "error": `not all employee are here` })
            return
        }

        try {
            const ShowtimeCreated = await showtimeRepository.save(
                showtimeRequest
            )
            res.status(201).send(ShowtimeCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/showtimes/planning/",authMiddlewareAll,async (req: Request, res: Response) => {
        
        let { startDate, endDate} = req.query;

        const validationResultQuery = showtimePlanningValidation.validate(req.query)


        if (validationResultQuery.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultQuery.error.details))
            return
        }


        const showtimeUsecase = new ShowtimeUsecase(AppDataSource);
        const query = await showtimeUsecase.getShowtimePlanning(startDate as string, endDate as string);

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

    app.get("/showtimes",authMiddlewareAll, async (req: Request, res: Response) => {
        const validation = listShowtimeValidation.validate(req.query)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listShowtimeRequest = validation.value
        let limit = 20
        if (listShowtimeRequest.limit) {
            limit = listShowtimeRequest.limit
        }
        const page = listShowtimeRequest.page ?? 1

        try {
            const showtimeUsecase = new ShowtimeUsecase(AppDataSource);
            const listShowtimes = await showtimeUsecase.listShowtime({ ...listShowtimeRequest, page, limit })
            res.status(200).send(listShowtimes)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
    app.get("/showtimes/:id",authMiddlewareAll, async (req: Request, res: Response) => {
        try {
            const validationResult = showtimeIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const showtimeId = validationResult.value

            const showtimeUsecase = new ShowtimeUsecase(AppDataSource);
            const showtime = await showtimeUsecase.getOneShowtime(showtimeId.id)
            if (showtime === null) {
                res.status(404).send({ "error": `showtime ${showtimeId.id} not found` })
                return
            }
            res.status(200).send(showtime)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })



    app.delete("/showtimes/:id", authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const validationResult = showtimeIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const showtimeId = validationResult.value
    
            const showtimeRepository = AppDataSource.getRepository(Showtime)
            const showtime = await showtimeRepository.findOneBy({ id: showtimeId.id })
            if (showtime === null) {
                res.status(404).send({ "error": `showtime ${showtimeId.id} not found` })
                return
            }
    
            await showtimeRepository.remove(showtime)
            res.status(200).send(`Successfully deleted`)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.patch("/showtimes/:id",authMiddlewareAdmin, async (req: Request, res: Response) => {

        const validation = updateShowtimeValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateShowtimeRequest = validation.value

        try {

            const showtimeUsecase = new ShowtimeUsecase(AppDataSource);


            const showtime = await showtimeUsecase.foundShowtime(updateShowtimeRequest.id)
            
            if (showtime === null) {
                res.status(404).send({ "error": `Salle ${updateShowtimeRequest.id} not found` })
                return
            }

            const planningUseCase = new PlanningUsecase(AppDataSource);
            if(updateShowtimeRequest.start_datetime !== undefined && updateShowtimeRequest.end_datetime !== undefined){
                const verifyPlanning = await planningUseCase.verifyPlanning(updateShowtimeRequest.start_datetime, updateShowtimeRequest.end_datetime)
    
                console.log("ici**********",verifyPlanning[0].postesCouverts)
        
                if(verifyPlanning[0].postesCouverts !== "3"){
                    res.status(404).send({ "error": `not all employee are here` })
                    return
                }
            }
            else if(updateShowtimeRequest.start_datetime !== undefined && updateShowtimeRequest.end_datetime === undefined){
                const verifyPlanning = await planningUseCase.verifyPlanning(updateShowtimeRequest.start_datetime, showtime.end_datetime)
    
                console.log("ici**********",updateShowtimeRequest.start_datetime)
        
                if(verifyPlanning[0].postesCouverts !== "3"){
                    res.status(404).send({ "error": `not all employee are here` })
                    return
                }
            }
            else if(updateShowtimeRequest.start_datetime === undefined && updateShowtimeRequest.end_datetime !== undefined){
                const verifyPlanning = await planningUseCase.verifyPlanning(showtime.start_datetime, updateShowtimeRequest.end_datetime)
    
                console.log("ici**********",verifyPlanning[0].postesCouverts)
        
                if(verifyPlanning[0].postesCouverts !== "3"){
                    res.status(404).send({ "error": `not all employee are here` })
                    return
                }
            }

            const updatedShowtime = await showtimeUsecase.updateShowtime(updateShowtimeRequest.id, { ...updateShowtimeRequest })

            res.status(200).send(updatedShowtime)
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
 *   Showtime:
 *    type: object
 *    required:
 *     - salle
 *     - movie
 *     - start_datetime
 *     - end_datetime
 *     - special_notes
 *    properties: 
 *     id:
 *       type: integer
 *       description: The auto-generated id of the showtime
 *     salle:
 *       type: salle
 *       description: The salle of the showtime
 *     movie:
 *       type: movie
 *       description: The movie of the showtime
 *     start_datetime:
 *       type: string
 *       format: date-time
 *       description: The start datetime of the showtime
 *     end_datetime:
 *       type: string
 *       format: date-time
 *       description: The end datetime of the showtime
 *     special_notes:
 *       type: string
 *       description: The special notes of the showtime
 * 
 * tags:
 *  name: [Séances]
 */

/**
 * @openapi
 * /showtimes:
 *   post:
 *     tags:
 *       - Séances
 *     summary: Create a new showtime
 *     description: Create a new showtime with provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Showtime'
 *     responses:
 *       201:
 *         description: Showtime created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Showtime'
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
 * /showtimes/{id}:
 *   patch:
 *     tags:
 *       - Séances
 *     summary: Update a showtime by ID
 *     description: Update a specific showtime by specifying its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the showtime to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Showtime'
 *     responses:
 *       200:
 *         description: Showtime updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Showtime'
 *       400:
 *         description: Invalid request data or showtime not found.
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
 * /showtimes:
 *   get:
 *     tags:
 *       - Séances
 *     summary: Get a list of showtimes
 *     description: Retrieve a list of showtimes.
 *     responses:
 *       200:
 *         description: List of showtimes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Showtime'
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
 * /showtimes/{id}:
 *   get:
 *     tags:
 *       - Séances
 *     summary: Get a showtime by ID
 *     description: Retrieve a specific showtime by specifying its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the showtime to retrieve.
 *     responses:
 *       200:
 *         description: Showtime retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Showtime'
 *       404:
 *         description: Showtime not found.
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
 * /showtimes/count/{id}:
 *   get:
 *     tags:
 *       - Séances
 *     summary: Get the number of spectators for a showtime
 *     description: Retrieve the number of spectators for a specific showtime by specifying its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the showtime to count spectators for.
 *     responses:
 *       200:
 *         description: Number of spectators retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Number of spectators for the specified showtime.
 *       404:
 *         description: Showtime not found.
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
 * /showtimes/{id}:
 *   delete:
 *     tags:
 *       - Séances
 *     summary: Delete a showtime by ID
 *     description: Delete a specific showtime by specifying its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the showtime to delete.
 *     responses:
 *       200:
 *         description: Showtime deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Success message
 *       404:
 *         description: Showtime not found.
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
