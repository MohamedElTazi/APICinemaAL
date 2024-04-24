import express, { Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import {  createMovieValidation, listMovieValidation, moviePlanningValidation, movieIdValidation, updateMovieValidation } from "../validators/movie-validator";
import { AppDataSource } from "../../database/database";
import { Movie } from "../../database/entities/movie";
import { authMiddlewareUser } from "../middleware/auth-middleware";
import { MovieUsecase } from "../../domain/movie-usecase";
import { Showtime } from "../../database/entities/showtime";


export const MovieHandler = (app: express.Express) => {
    
    app.get("/movies", async (req: Request, res: Response) => {
        const validation = listMovieValidation.validate(req.query)

    if (validation.error) {
        res.status(400).send(generateValidationErrorMessage(validation.error.details))
        return
    }

    const listMovieRequest = validation.value
    let limit = 20
    if (listMovieRequest.limit) {
        limit = listMovieRequest.limit
    }
    const page = listMovieRequest.page ?? 1

    try {
        const movieUsecase = new MovieUsecase(AppDataSource);
        const listMovies = await movieUsecase.listSalle({ ...listMovieRequest, page, limit })
        res.status(200).send(listMovies)
    } catch (error) {
        console.log(error)
    }
    })

    app.get("/movies/planning/:id",authMiddlewareUser ,async (req: Request, res: Response) => {

        const validationResultParams = movieIdValidation.validate(req.params)

        if (validationResultParams.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultParams.error.details))
            return
        }
        const movieId = validationResultParams.value

        const movieRepository = AppDataSource.getRepository(Movie)
        const movie = await movieRepository.findOneBy({ id: movieId.id })
        if (movie === null) {
            res.status(404).send({ "error": `salle ${movieId.id} not found` })
            return
        }
        
        const { startDate, endDate} = req.query;



        const validationResultQuery = moviePlanningValidation.validate(req.query)


        if (validationResultQuery.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultQuery.error.details))
            return
        }


        let query = AppDataSource
        .getRepository(Showtime)
        .createQueryBuilder("showtime")
        .leftJoinAndSelect("showtime.salle", "salle")
        .leftJoinAndSelect("showtime.movie", "movie")
        .select([
            "salle.name",
            "salle.description",
            "salle.type",
            "movie.title",
            "movie.description",
            "showtime.start_time",
            "showtime.end_time",
            "showtime.special_notes"
        ])
        .where("salle.maintenance_status = false")
        .andWhere("salle.id = :id", { id: movieId.id });

        if (startDate && endDate) {
            query = query.andWhere("showtime.date BETWEEN :startDate AND :endDate", { startDate, endDate });
        }else if(startDate && !endDate){
            query = query.andWhere("showtime.date >= :startDate", { startDate });
        }else if(!startDate && endDate){
            query = query.andWhere("showtime.date <= :endDate", { endDate });
        }



        try {
            const planning = await query.orderBy("showtime.date", "ASC").getMany();

            res.status(200).send(planning);
        } catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });


    app.post("/movies", async (req: Request, res: Response) => {
        const validation = createMovieValidation.validate(req.body)
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const movieRequest = validation.value
        const movieRepo = AppDataSource.getRepository(Movie)
        console.log("ok")
        try {
    
            const movieCreated = await movieRepo.save(
                movieRequest
            )
            res.status(201).send(movieCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })
    

    
    app.delete("/movies/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = movieIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const movieId = validationResult.value
    
            const MovieRepository = AppDataSource.getRepository(Movie)
            const movie = await MovieRepository.findOneBy({ id: movieId.id })
            if (movie === null) {
                res.status(404).send({ "error": `salle ${movieId.id} not found` })
                return
            }
    
            const MovieDeleted = await MovieRepository.remove(movie)
            res.status(200).send(MovieDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
    app.get("/movies/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = movieIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const movieId = validationResult.value
    
            const movieRepository = AppDataSource.getRepository(Movie)
            const movie = await movieRepository.findOneBy({ id: movieId.id })
            if (movie === null) {
                res.status(404).send({ "error": `movie ${movieId.id} not found` })
                return
            }
            res.status(200).send(movie)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
    
    
    app.patch("/movies/:id", async (req: Request, res: Response) => {
    
        const validation = updateMovieValidation.validate({ ...req.params, ...req.body })
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const UpdateMovieRequest = validation.value
    
        try {
            const movieUsecase = new MovieUsecase(AppDataSource);
    
            const validationResult = movieIdValidation.validate(req.params)
    
            if (validationResult.error) {
                res.status(400).send(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const movieId = validationResult.value
    
    
            const updatedMovie = await movieUsecase.updateMovie(
                UpdateMovieRequest.id,
                { ...UpdateMovieRequest }
                )
    
            if (updatedMovie === null) {
                res.status(404).send({ "error": `Movie ${UpdateMovieRequest.id} not found `})
                return
            }
    
    
    
            res.status(200).send(updatedMovie)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
}
