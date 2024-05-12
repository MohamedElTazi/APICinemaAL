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
exports.PlanningHandler = void 0;
const database_1 = require("../../database/database");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const planning_validator_1 = require("../validators/planning-validator");
const planning_1 = require("../../database/entities/planning");
const planning_usecase_1 = require("../../domain/planning-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const PlanningHandler = (app) => {
    app.post("/plannings", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const reqBodyStartDatetime = req.body.start_datetime;
        const reqBodyEndDatetime = req.body.end_datetime;
        const validation = planning_validator_1.createPlanningValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const planningRequest = validation.value;
        const planningRepository = database_1.AppDataSource.getRepository(planning_1.Planning);
        planningRequest.end_datetime = reqBodyEndDatetime;
        planningRequest.start_datetime = reqBodyStartDatetime;
        const planningUseCase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
        const verifyPoste = yield planningUseCase.verifyPoste(planningRequest.poste, planningRequest.start_datetime, planningRequest.end_datetime);
        console.log("ici**********", verifyPoste[0]['COUNT(*)']);
        if (verifyPoste[0]['COUNT(*)'] === "1") {
            res.status(404).send({ "error": `this poste is already take at this time` });
            return;
        }
        try {
            const PlanningCreated = yield planningRepository.save(planningRequest);
            res.status(201).send(PlanningCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/plannings", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = planning_validator_1.listPlanningValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listPlanningRequest = validation.value;
        let limit = 20;
        if (listPlanningRequest.limit) {
            limit = listPlanningRequest.limit;
        }
        const page = (_a = listPlanningRequest.page) !== null && _a !== void 0 ? _a : 1;
        const planningRepository = database_1.AppDataSource.getRepository(planning_1.Planning);
        try {
            const planningUsecase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
            const listPlanning = yield planningUsecase.listPlanning(Object.assign(Object.assign({}, listPlanningRequest), { page, limit }));
            res.status(200).send(listPlanning);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/plannings/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = planning_validator_1.planningIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const planningId = validationResult.value;
            const planningRepository = database_1.AppDataSource.getRepository(planning_1.Planning);
            const planning = yield planningRepository.findOneBy({ id: planningId.id });
            if (planning === null) {
                res.status(404).send({ "error": `planning ${planningId.id} not found` });
                return;
            }
            res.status(200).send(planning);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/plannings/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = planning_validator_1.planningIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const planningId = validationResult.value;
            const planningRepository = database_1.AppDataSource.getRepository(planning_1.Planning);
            const planning = yield planningRepository.findOneBy({ id: planningId.id });
            if (planning === null) {
                res.status(404).send({ "error": `planning ${planningId.id} not found` });
                return;
            }
            yield planningRepository.remove(planning);
            res.status(200).send(`Successfully deleted`);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/plannings/:id", auth_middleware_1.authMiddlewareSuperAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = planning_validator_1.updatePlanningValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        const reqBodyStartDatetime = req.body.start_datetime;
        const reqBodyEndDatetime = req.body.end_datetime;
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updatePlanningRequest = validation.value;
        updatePlanningRequest.end_datetime = reqBodyEndDatetime;
        updatePlanningRequest.start_datetime = reqBodyStartDatetime;
        try {
            const planningUsecase = new planning_usecase_1.PlanningUsecase(database_1.AppDataSource);
            const planning = yield planningUsecase.foundPlanningById(updatePlanningRequest.id);
            if (planning === null) {
                res.status(404).send({ "error": `planning ${updatePlanningRequest.id} not found` });
                return;
            }
            if ((updatePlanningRequest.poste !== undefined && updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime === undefined) ||
                (updatePlanningRequest.poste !== undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined) ||
                (updatePlanningRequest.poste === undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime !== undefined) ||
                (updatePlanningRequest.poste !== undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime === undefined) ||
                (updatePlanningRequest.poste !== undefined && updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime !== undefined) ||
                (updatePlanningRequest.poste === undefined && updatePlanningRequest.start_datetime !== undefined && updatePlanningRequest.end_datetime === undefined) ||
                (updatePlanningRequest.poste === undefined && updatePlanningRequest.start_datetime === undefined && updatePlanningRequest.end_datetime !== undefined)) {
                const post = updatePlanningRequest.poste !== undefined ? updatePlanningRequest.poste : planning.poste;
                const startDatetime = updatePlanningRequest.start_datetime !== undefined ? updatePlanningRequest.start_datetime : planning.start_datetime;
                const endDatetime = updatePlanningRequest.end_datetime !== undefined ? updatePlanningRequest.end_datetime : planning.end_datetime;
                const verifyPoste = yield planningUsecase.verifyPoste(planning.poste, planning.start_datetime, updatePlanningRequest.end_datetime);
                if (verifyPoste[0]['COUNT(*)'] >= "1") {
                    res.status(404).send({ "error": `this poste is already take at this time` });
                    return;
                }
            }
            const updatedPlanning = yield planningUsecase.updatePlanning(updatePlanningRequest.id, Object.assign({}, updatePlanningRequest));
            res.status(200).send(updatedPlanning);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.PlanningHandler = PlanningHandler;
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
