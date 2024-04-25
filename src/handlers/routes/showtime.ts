import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createShowtimeValidation, listShowtimeValidation, showtimeIdValidation, showtimePlanningValidation, updateShowtimeValidation,  } from "../validators/showtime-validator";
import { AppDataSource } from "../../database/database";
import { Showtime } from "../../database/entities/showtime";
import { ShowtimeUsecase } from "../../domain/showtime-usecase";
import { UserHandler } from "./user";
import { authMiddlewareAdmin, authMiddlewareUser } from "../middleware/auth-middleware";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";


export const ShowtimeHandler = (app: express.Express) => {

    
    app.post("/showtimes", async (req: Request, res: Response) => {
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

    app.get("/showtimes/planning/",/*authMiddlewareUser ,*/async (req: Request, res: Response) => {
        
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

    app.get("/showtimes", async (req: Request, res: Response) => {
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
    
    app.get("/showtimes/:id", async (req: Request, res: Response) => {
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
            res.status(200).send(showtime)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/showtimes/count/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = showtimeIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const showtimeId = validationResult.value

            const showtimeRepository = AppDataSource.getRepository(Showtime)


            const showtimeUsecase = new ShowtimeUsecase(AppDataSource);
            const count = await showtimeUsecase.getCountByShowtimeId(showtimeId.id)

            if (count === null) {
                res.status(404).send({ "error": `showtime ${showtimeId.id} not found` })
                return
            }

            res.status(200).send("Number of spectators : " + count)
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


    app.patch("/showtimes/:id", authMiddlewareAdmin, async (req: Request, res: Response) => {

        const validation = updateShowtimeValidation.validate({ ...req.params, ...req.body })

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const updateShowtimeRequest = validation.value

        try {
            const showtimeUsecase = new ShowtimeUsecase(AppDataSource);


            const updatedShowtime = await showtimeUsecase.updateShowtime(updateShowtimeRequest.id, { ...updateShowtimeRequest })
            
            if (updatedShowtime === null) {
                res.status(404).send({ "error": `Salle ${updateShowtimeRequest.id} not found` })
                return
            }

            res.status(200).send(updatedShowtime)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


}