import express, { query, Request, Response } from "express";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import {  createMovieValidation, listMovieValidation, moviePlanningValidation, movieIdValidation, updateMovieValidation } from "../validators/movie-validator";
import { AppDataSource } from "../../database/database";
import { Movie } from "../../database/entities/movie";
import { authMiddlewareAll, authMiddlewareAdmin } from "../middleware/auth-middleware";
import { MovieUsecase } from "../../domain/movie-usecase";


export const MovieHandler = (app: express.Express) => {
    

    app.get("/movies", authMiddlewareAll ,async (req: Request, res: Response) => {
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
    });


    app.get("/movies/planning/:id",authMiddlewareAll ,async (req: Request, res: Response) => {

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
        
        let { startDate, endDate} = req.query;



        const validationResultQuery = moviePlanningValidation.validate(req.query)


        if (validationResultQuery.error) {
            res.status(400).send(generateValidationErrorMessage(validationResultQuery.error.details))
            return
        }

        const movieUsecase = new MovieUsecase(AppDataSource);

        const query = await movieUsecase.getMoviePlanning(startDate as string, endDate as string, movieId.id);


        if(query === null){
            res.status(404).send(Error("Error fetching planning"))
            return
        }

        try {
            const planning = await query.orderBy("showtime.start_datetime", "ASC").getMany();

            res.status(200).send(planning);
        } catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });






    app.get("/movies/available/", authMiddlewareAll ,async (req: Request, res: Response) => {


        const movieUsecase = new MovieUsecase(AppDataSource);

        const query = await movieUsecase.getMovieAvailable();

        if(query === null){
            res.status(404).send(Error("Error fetching planning"))
            return
        }
        try {
            const planning = await query.orderBy("showtime.start_datetime", "ASC").getMany();

            res.status(200).send(planning);
        } catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })




    app.post("/movies", authMiddlewareAdmin ,async (req: Request, res: Response) => {
        const validation = createMovieValidation.validate(req.body)
    
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }
    
        const movieRequest = validation.value
        const movieRepo = AppDataSource.getRepository(Movie)

        const movieUsecase = new MovieUsecase(AppDataSource);

        movieRequest.duration = movieUsecase.formatTime(+movieRequest.duration)
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
    

    app.delete("/movies/:id", authMiddlewareAdmin ,async (req: Request, res: Response) => {
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



    
    app.get("/movies/:id", authMiddlewareAll ,async (req: Request, res: Response) => {
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
    
    

    
    app.patch("/movies/:id" ,async (req: Request, res: Response) => {
    
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
    
            if(UpdateMovieRequest.duration){
                const movieUsecase = new MovieUsecase(AppDataSource)
                const updateShowtimeEndDatetimesOnFilmDurationChange = await movieUsecase.updateShowtimeEndDatetimesOnFilmDurationChange(UpdateMovieRequest.id, +UpdateMovieRequest.duration)
                if(updateShowtimeEndDatetimesOnFilmDurationChange  === `Showtime not found` ){
                    return res.status(404).send({ error: "Showtime not found" })
                }


                if(updateShowtimeEndDatetimesOnFilmDurationChange  === "Not all employees are available" ){
                    return res.status(500).send({ error: "Not all employees are available" })
                }
                UpdateMovieRequest.duration = movieUsecase.formatTime(+UpdateMovieRequest.duration)
            }
                
    
            const updatedMovie = await movieUsecase.updateMovie(UpdateMovieRequest.id,{ ...UpdateMovieRequest })
    
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - duration
 *         - description
 *         - genre
 *         - showtimes
 *       properties:
 *         id:
 *           type: number
 *           description: The ID of the movie
 *         title:
 *           type: string
 *           description: The title of the movie
 *         duration:
 *           type: string
 *           description: The duration of the movie
 *         description:
 *           type: string
 *           description: Description of the movie
 *         genre:
 *           type: string
 *           description: The genre of the movie
 *         showtimes:
 *           type: showtimes
 *           description: Showtimes of the movie
 * tags:
 *  name: Movies
 *  description: Endpoints related to  movies 
 */

/**
* @openapi
* /movies:
 *   get:
 *     tags: [Movies]
 *     summary: Get a list of all movies
 *     description: Retrieve a paginated list of movies.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to return per page (default is 20)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *     responses:
 *       200:
 *         description: A paginated list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Bad request, validation error
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
 * 
 * 
 */

/**
 * 
 * @openapi
 * /movies/planning/{id}:
 *  get:
 *     tags: [Movies]
 *     summary: Get movie planning by ID
 *     description: Retrieve the planning for a specific movie by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the movie
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering the movie planning
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering the movie planning
 *     responses:
 *       200:
 *         description: A list of movie planning items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the planning item
 *                   movieId:
 *                     type: integer
 *                     description: ID of the movie associated with the planning item
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                     description: Start date and time of the planning item
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     description: End date and time of the planning item
 *       400:
 *         description: Bad request, validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: Movie not found
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
 * /movies/available:
 *   get:
 *     tags: [Movies]
 *     summary: Get available movies
 *     description: Retrieve a list of available movies.
 *     responses:
 *       200:
 *         description: A list of available movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the movie
 *                   title:
 *                     type: string
 *                     description: Title of the movie
 *                   duration:
 *                     type: string
 *                     format: date-time
 *                     description: Duration of the movie
 *                   genre:
 *                     type: string
 *                     description: Genre of the movie
 *       404:
 *         description: Movies not found
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
 * /movies:
 *   post:
 *     tags: [Movies]
 *     summary: Create a new movie
 *     description: Create a new movie with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the movie
 *               description:
 *                type: string
 *                description: Description of the movie
 *               duration:
 *                 type: string
 *                 description: Duration of the movie in HH:MM format
 *               genre:
 *                 type: string
 *                 description: Genre of the movie
 *             required:
 *               - title
 *               - description
 *               - duration
 *               - genre
 *     responses:
 *       201:
 *         description: The newly created movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
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
 * 
 */

/**
* @openapi
* /movies/{id}:
*   delete:
*     tags: [Movies]
*     summary: Delete a movie by ID
*     description: Delete a movie with the specified ID.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: ID of the movie to delete
*     responses:
*       200:
*         description: Movie successfully deleted
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Success message
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
*       404:
*         description: Movie not found
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
* 
*/




    /**
 * @openapi
 * /movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Get a movie by ID
 *     description: Retrieve a movie with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to retrieve
 *     responses:
 *       200:
 *         description: Movie found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
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
 *       404:
 *         description: Movie not found
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
 * /movies/{id}:
 *   patch:
 *     tags: [Movies]
 *     summary: Update a movie by ID
 *     description: Update a movie with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the movie to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Movie successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
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
 *       404:
 *         description: Movie not found
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