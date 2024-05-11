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
const showtime_1 = require("../../database/entities/showtime");
const MovieHandler = (app) => {
    app.get("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let query = database_1.AppDataSource
            .getRepository(showtime_1.Showtime)
            .createQueryBuilder("showtime")
            .leftJoinAndSelect("showtime.salle", "salle")
            .leftJoinAndSelect("showtime.movie", "movie")
            .select([
            "salle.name",
            "salle.description",
            "salle.type",
            "movie.title",
            "movie.description",
            "showtime.start_datetime",
            "showtime.end_datetime",
            "showtime.special_notes"
        ])
            .where("salle.maintenance_status = false")
            .andWhere("salle.id = :id", { id: movieId.id });
        if (startDate && endDate) {
            endDate = endDate + " 23:59:59";
            query = query.andWhere("showtime.start_datetime >= :startDate AND showtime.end_datetime <= :endDate", { startDate, endDate });
        }
        else if (startDate && !endDate) {
            query = query.andWhere("showtime.start_datetime >= :startDate", { startDate });
        }
        else if (!startDate && endDate) {
            endDate = endDate + " 23:59:59";
            query = query.andWhere("showtime.end_datetime <= :endDate", { endDate });
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
    app.post("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = movie_validator_1.createMovieValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const movieRequest = validation.value;
        const movieRepo = database_1.AppDataSource.getRepository(movie_1.Movie);
        console.log("ok");
        try {
            const movieCreated = yield movieRepo.save(movieRequest);
            res.status(201).send(movieCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.get("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.patch("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
