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
exports.ShowtimeHandler = void 0;
const generate_validation_message_1 = require("../validators/generate-validation-message");
const showtime_validator_1 = require("../validators/showtime-validator");
const database_1 = require("../../database/database");
const showtime_1 = require("../../database/entities/showtime");
const showtime_usecase_1 = require("../../domain/showtime-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const planning_usecase_1 = require("../../domain/planning-usecase");
const ShowtimeHandler = (app) => {
    app.post("/showtimes", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const reqBodyStartDatetime = req.body.start_datetime;
        req.body.start_datetime = req.body.start_datetime + "Z";
        const validation = showtime_validator_1.createShowtimeValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const showtimeRequest = validation.value;
        const showtimeRepository = database_1.AppDataSource.getRepository(showtime_1.Showtime);
        const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
        const end_datetime = yield showtimeUsecase.getMovieDuration(req.body.movie, req.body.start_datetime);
        if (end_datetime === null) {
            res.status(404).send({ "error": `movie ${showtimeRequest.movie.id} not found` });
            return;
        }
        const utcDate = (0, date_fns_tz_1.toZonedTime)(end_datetime, 'UTC');
        const formattedDatetime = (0, date_fns_1.format)(utcDate, "yyyy-MM-dd'T'HH:mm:ss");
        req.body.end_datetime = formattedDatetime;
        showtimeRequest.end_datetime = req.body.end_datetime;
        showtimeRequest.start_datetime = reqBodyStartDatetime;
        if (yield showtimeUsecase.isOverlap(showtimeRequest)) {
            res.status(404).send({ "error": `New showtime is overlap with other showtime` });
            return;
        }
        const planningUseCase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
        const verifyPlanning = yield planningUseCase.verifyPlanning(showtimeRequest.start_datetime, showtimeRequest.end_datetime);
        if (verifyPlanning[0].postesCouverts !== "3") {
            res.status(404).send({ "error": `not all employee are here` });
            return;
        }
        try {
            const ShowtimeCreated = yield showtimeRepository.save(showtimeRequest);
            res.status(201).send(ShowtimeCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/showtimes/planning/", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { startDate, endDate } = req.query;
        const validationResultQuery = showtime_validator_1.showtimePlanningValidation.validate(req.query);
        if (validationResultQuery.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResultQuery.error.details));
            return;
        }
        const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
        const query = yield showtimeUsecase.getShowtimePlanning(startDate, endDate);
        if (query === null) {
            res.status(404).send(Error("Error fetching planning"));
            return;
        }
        try {
            const planning = yield query.orderBy("showtime.start_datetime", "ASC").getMany();
            planning.forEach((showtime) => {
                showtime.start_datetime = (0, date_fns_tz_1.toZonedTime)(showtime.start_datetime, '+04:00');
                showtime.end_datetime = (0, date_fns_tz_1.toZonedTime)(showtime.end_datetime, '+04:00');
            });
            res.status(200).send(planning);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.get("/showtimes", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = showtime_validator_1.listShowtimeValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listShowtimeRequest = validation.value;
        let limit = 20;
        if (listShowtimeRequest.limit) {
            limit = listShowtimeRequest.limit;
        }
        const page = (_a = listShowtimeRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
            const listShowtimes = yield showtimeUsecase.listShowtime(Object.assign(Object.assign({}, listShowtimeRequest), { page, limit }));
            res.status(200).send(listShowtimes);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/showtimes/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = showtime_validator_1.showtimeIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const showtimeId = validationResult.value;
            const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
            const showtime = yield showtimeUsecase.getOneShowtime(showtimeId.id);
            if (showtime === null) {
                res.status(404).send({ "error": `showtime ${showtimeId.id} not found` });
                return;
            }
            res.status(200).send(showtime);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/showtimes/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = showtime_validator_1.showtimeIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const showtimeId = validationResult.value;
            const showtimeRepository = database_1.AppDataSource.getRepository(showtime_1.Showtime);
            const showtime = yield showtimeRepository.findOneBy({ id: showtimeId.id });
            if (showtime === null) {
                res.status(404).send({ "error": `showtime ${showtimeId.id} not found` });
                return;
            }
            yield showtimeRepository.remove(showtime);
            res.status(200).send(`Successfully deleted`);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/showtimes/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = showtime_validator_1.updateShowtimeValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateShowtimeRequest = validation.value;
        try {
            const showtimeUsecase = new showtime_usecase_1.ShowtimeUsecase(database_1.AppDataSource);
            const showtime = yield showtimeUsecase.foundShowtime(updateShowtimeRequest.id);
            if (showtime === null) {
                res.status(404).send({ "error": `Salle ${updateShowtimeRequest.id} not found` });
                return;
            }
            const planningUseCase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
            if ((updateShowtimeRequest.start_datetime !== undefined && updateShowtimeRequest.end_datetime !== undefined) ||
                (updateShowtimeRequest.start_datetime !== undefined && updateShowtimeRequest.end_datetime === undefined) ||
                (updateShowtimeRequest.start_datetime === undefined && updateShowtimeRequest.end_datetime !== undefined) ||
                (updateShowtimeRequest.start_datetime === undefined && updateShowtimeRequest.end_datetime === undefined)) {
                const startDatetime = updateShowtimeRequest.start_datetime !== undefined ? updateShowtimeRequest.start_datetime : showtime.start_datetime;
                const endDatetime = updateShowtimeRequest.end_datetime !== undefined ? updateShowtimeRequest.end_datetime : showtime.end_datetime;
                const verifyPlanning = yield planningUseCase.verifyPlanning(startDatetime, endDatetime);
                if (verifyPlanning[0].postesCouverts !== "3") {
                    res.status(404).send({ "error": `not all employees are available` });
                    return;
                }
            }
            const updatedShowtime = yield showtimeUsecase.updateShowtime(updateShowtimeRequest.id, Object.assign({}, updateShowtimeRequest));
            res.status(200).send(updatedShowtime);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.ShowtimeHandler = ShowtimeHandler;
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
