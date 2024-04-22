import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createShowtimeValidation, listShowtimeValidation, showtimeIdValidation, updateShowtimeValidation } from "../validators/showtime-validator";
import { AppDataSource } from "../../database/database";
import { Showtime } from "../../database/entities/showtime";
import { ShowtimeUsecase } from "../../domain/showtime-usecase";
import { UserHandler } from "./user";
import { authMiddlewareAdmin, authMiddlewareUser } from "../middleware/auth-middleware";


export const ShowtimeHandler = (app: express.Express) => {

    // async function isOverlapping(newShowtime: Showtime) {
    //     const showtimes = await AppDataSource.getRepository(Showtime).createQueryBuilder("showtime")
    //         .where("showtime.movieId = :movieId", { movieId: newShowtime.movie })
    //         .andWhere("showtime.date = :date", { date: newShowtime.date })
    //         .getMany();
    
    //     return showtimes.some(existingShowtime => {
    //         const [existingStart, existingEnd] = [existingShowtime.start_time, existingShowtime.end_time];
    //         const [newStart, newEnd] = [newShowtime.start_time, newShowtime.end_time];
    
    //         return (newStart < existingEnd && newEnd > existingStart) &&
    //                existingShowtime.salle !== newShowtime.salle;
    //     });
    // }
    

    app.post("/showtimes",authMiddlewareAdmin ,async (req: Request, res: Response) => {
        console.log(UserHandler.name)
        const validation = createShowtimeValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
        console.log(validation.value)
        const ShowtimeRequest = validation.value
        const ShowtimeRepo = AppDataSource.getRepository(Showtime)

        // if (await isOverlapping(ShowtimeRequest)) {
        //     res.status(409).send({ error: "Showtime conflicts with an existing showtime for the same movie in a different hall." });
        //     return;
        // }
        try {

            const ShowtimeCreated = await ShowtimeRepo.save(
                ShowtimeRequest
            )
            res.status(201).send(ShowtimeCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })

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