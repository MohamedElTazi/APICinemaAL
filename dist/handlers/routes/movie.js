"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieHandler = void 0;
const generate_validation_message_1 = require("../validators/generate-validation-message");
const movie_validator_1 = require("../validators/movie-validator");
const database_1 = require("../../database/database");
const movie_1 = require("../../database/entities/movie");
const auth_middleware_1 = require("../middleware/auth-middleware");
const movie_usecase_1 = require("../../domain/movie-usecase");
const MovieHandler = (app) => {
    app.get("/movies", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = movie_validator_1.listMovieValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listMovieRequest = validation.value;
        let limit = 20;
        if (listMovieRequest.limit) {
            limit = listMovieRequest.limit;
        }
        const page = (_a = listMovieRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
            const listMovies = yield movieUsecase.listSalle(Object.assign(Object.assign({}, listMovieRequest), { page, limit }));
            res.status(200).send(listMovies);
        }
        catch (error) {
            console.log(error);
        }
    }));
    app.get("/movies/planning/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validationResultParams = movie_validator_1.movieIdValidation.validate(req.params);
        if (validationResultParams.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResultParams.error.details));
            return;
        }
        const movieId = validationResultParams.value;
        const movieRepository = database_1.AppDataSource.getRepository(movie_1.Movie);
        const movie = yield movieRepository.findOneBy({ id: movieId.id });
        if (movie === null) {
            res.status(404).send({ "error": `salle ${movieId.id} not found` });
            return;
        }
        let { startDate, endDate } = req.query;
        const validationResultQuery = movie_validator_1.moviePlanningValidation.validate(req.query);
        if (validationResultQuery.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResultQuery.error.details));
            return;
        }
        const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
        const query = yield movieUsecase.getMoviePlanning(startDate, endDate, movieId.id);
        if (query === null) {
            res.status(404).send(Error("Error fetching planning"));
            return;
        }
        try {
            const planning = yield query.orderBy("showtime.start_datetime", "ASC").getMany();
            res.status(200).send(planning);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.get("/movies/available/", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
        const query = yield movieUsecase.getMovieAvailable();
        if (query === null) {
            res.status(404).send(Error("Error fetching planning"));
            return;
        }
        try {
            const planning = yield query.orderBy("showtime.start_datetime", "ASC").getMany();
            res.status(200).send(planning);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.post("/movies", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = movie_validator_1.createMovieValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const movieRequest = validation.value;
        const movieRepo = database_1.AppDataSource.getRepository(movie_1.Movie);
        const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
        movieRequest.duration = movieUsecase.formatTime(+movieRequest.duration);
        try {
            const movieCreated = yield movieRepo.save(movieRequest);
            res.status(201).send(movieCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/movies/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = movie_validator_1.movieIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const movieId = validationResult.value;
            const MovieRepository = database_1.AppDataSource.getRepository(movie_1.Movie);
            const movie = yield MovieRepository.findOneBy({ id: movieId.id });
            if (movie === null) {
                res.status(404).send({ "error": `salle ${movieId.id} not found` });
                return;
            }
            const MovieDeleted = yield MovieRepository.remove(movie);
            res.status(200).send(MovieDeleted);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/movies/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = movie_validator_1.movieIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const movieId = validationResult.value;
            const movieRepository = database_1.AppDataSource.getRepository(movie_1.Movie);
            const movie = yield movieRepository.findOneBy({ id: movieId.id });
            if (movie === null) {
                res.status(404).send({ "error": `movie ${movieId.id} not found` });
                return;
            }
            res.status(200).send(movie);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/movies/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = movie_validator_1.updateMovieValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const UpdateMovieRequest = validation.value;
        try {
            const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
            const validationResult = movie_validator_1.movieIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            if (UpdateMovieRequest.duration) {
                const movieUsecase = new movie_usecase_1.MovieUsecase(database_1.AppDataSource);
                const updateShowtimeEndDatetimesOnFilmDurationChange = movieUsecase.updateShowtimeEndDatetimesOnFilmDurationChange(UpdateMovieRequest.id, +UpdateMovieRequest.duration);
                if ((yield updateShowtimeEndDatetimesOnFilmDurationChange) === "not all employees are available") {
                    return res.status(500).send({ error: "not all employees are available" });
                }
                UpdateMovieRequest.duration = movieUsecase.formatTime(+UpdateMovieRequest.duration);
            }
            const updatedMovie = yield movieUsecase.updateMovie(UpdateMovieRequest.id, Object.assign({}, UpdateMovieRequest));
            if (updatedMovie === null) {
                res.status(404).send({ "error": `Movie ${UpdateMovieRequest.id} not found ` });
                return;
            }
            res.status(200).send(updatedMovie);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.MovieHandler = MovieHandler;
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
