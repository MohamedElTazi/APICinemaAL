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
exports.SalleHandler = void 0;
const generate_validation_message_1 = require("../validators/generate-validation-message");
const salle_validator_1 = require("../validators/salle-validator");
const database_1 = require("../../database/database");
const salle_1 = require("../../database/entities/salle");
const salle_usecase_1 = require("../../domain/salle-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const user_1 = require("./user");
const SalleHandler = (app) => {
    app.post("/salles", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(user_1.UserHandler.name);
        const validation = salle_validator_1.createSalleValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const salleRequest = validation.value;
        const salleRepo = database_1.AppDataSource.getRepository(salle_1.Salle);
        try {
            const salleCreated = yield salleRepo.save(salleRequest);
            res.status(201).send(salleCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/salles", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const validation = salle_validator_1.listSalleValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const listSalleRequest = validation.value;
        let limit = 20;
        if (listSalleRequest.limit) {
            limit = listSalleRequest.limit;
        }
        const page = (_a = listSalleRequest.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const salleUsecase = new salle_usecase_1.SalleUsecase(database_1.AppDataSource);
            const listSalles = yield salleUsecase.listSalle(Object.assign(Object.assign({}, listSalleRequest), { page, limit }));
            res.status(200).send(listSalles);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/salles/planning/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validationResultParams = salle_validator_1.salleIdValidation.validate(req.params);
        if (validationResultParams.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResultParams.error.details));
            return;
        }
        const salleId = validationResultParams.value;
        const salleRepository = database_1.AppDataSource.getRepository(salle_1.Salle);
        const salle = yield salleRepository.findOneBy({ id: salleId.id });
        if (salle === null) {
            res.status(404).send({ "error": `salle ${salleId.id} not found` });
            return;
        }
        const { startDate, endDate } = req.query;
        const validationResultQuery = salle_validator_1.sallePlanningValidation.validate(req.query);
        if (validationResultQuery.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResultQuery.error.details));
            return;
        }
        const salleUsecase = new salle_usecase_1.SalleUsecase(database_1.AppDataSource);
        const query = yield salleUsecase.getSallePlanning(startDate, endDate, salleId.id);
        if (query === null) {
            res.status(404).send({ "error": `salle ${salleId.id} not found` });
            return;
        }
        try {
            const planning = yield query.orderBy("showtime.date", "ASC").getMany();
            res.status(200).send(planning);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.get("/salles/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = salle_validator_1.salleIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const salleId = validationResult.value;
            const salleRepository = database_1.AppDataSource.getRepository(salle_1.Salle);
            const salle = yield salleRepository.findOneBy({ id: salleId.id });
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` });
                return;
            }
            res.status(200).send(salle);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/salles/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = salle_validator_1.salleIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const salleId = validationResult.value;
            const salleRepository = database_1.AppDataSource.getRepository(salle_1.Salle);
            const salle = yield salleRepository.findOneBy({ id: salleId.id });
            if (salle === null) {
                res.status(404).send({ "error": `salle ${salleId.id} not found` });
                return;
            }
            yield salleRepository.remove(salle);
            res.status(200).send(`Successfully deleted`);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/salles/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = salle_validator_1.updateSalleValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateSalleRequest = validation.value;
        try {
            const salleUsecase = new salle_usecase_1.SalleUsecase(database_1.AppDataSource);
            if (updateSalleRequest.capacity === undefined || updateSalleRequest.capacity < 15 || updateSalleRequest.capacity > 30) {
                res.status(404).send("error: Capacity not good");
                return;
            }
            const updatedSalle = yield salleUsecase.updateSalle(updateSalleRequest.id, Object.assign({}, updateSalleRequest));
            if (updatedSalle === null) {
                res.status(404).send({ "error": `Salle ${updateSalleRequest.id} not found` });
                return;
            }
            res.status(200).send(updatedSalle);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/salles/maintenance/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = salle_validator_1.updateSalleMaintenanceValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const updateSalleMaintenanceRequest = validation.value;
        try {
            const salleUsecase = new salle_usecase_1.SalleUsecase(database_1.AppDataSource);
            const updatedMaintenanceSalle = yield salleUsecase.updateMaintenanceSalle(updateSalleMaintenanceRequest.id, updateSalleMaintenanceRequest);
            if (updatedMaintenanceSalle === null) {
                res.status(404).send({ "error": `Salle ${updateSalleMaintenanceRequest.id} not found` });
                return;
            }
            res.status(200).send(updatedMaintenanceSalle);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.SalleHandler = SalleHandler;
/**
 * @openapi
 * components:
 *  schemas:
 *   salle:
 *    type: object
 *    properties:
 *     id:
 *      type: integer
 *      description: The auto-generated id of the salle.
 *     name:
 *      type: string
 *      description: The name of the salle.
 *     capacity:
 *      type: integer
 *      description: The capacity of the salle.
 *
 * tags:
 *  name: salles
 *  description: The salles managing API
 */
/**
 * @openapi
 * /salles:
 *   post:
 *     tags:
 *      [salles]
 *     summary: Create a new salle
 *     description: Create a new salle with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/salle'
 *     responses:
 *       201:
 *         description: salle created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'
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
 * /salles:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get all salles
 *     description: Retrieve a list of salles.
 *     responses:
 *       200:
 *         description: List of salles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/salle'
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
 */
/**
 * @openapi
 * /salles/planning/{id}:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get salle planning by ID
 *     description: Retrieve the planning of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to retrieve the planning for.
 *     responses:
 *       200:
 *         description: Success retrieving the salle planning.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/sallePlanning'
 *       400:
 *         description: Invalid request or parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
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
 * /salles/{id}:
 *   get:
 *     tags:
 *      [salles]
 *     summary: Get a salle by ID
 *     description: Retrieve details of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to retrieve.
 *     responses:
 *       200:
 *         description: Success retrieving the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'
 *       400:
 *         description: Invalid request or parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
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
 * /salles/{id}:
 *   delete:
 *     tags:
 *      [salles]
 *     summary: Delete a salle by ID
 *     description: Delete a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to delete.
 *     responses:
 *       200:
 *         description: Success deleting the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salle'

 *       400:
 *         description: Invalid parameter or request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
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
 * /salles/maintenance/{id}:
 *   patch:
 *     tags:
 *      [salles]
 *     summary: Update maintenance information of a salle by ID
 *     description: Update the maintenance details of a specific salle.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique identifier of the salle to update maintenance information for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/salleMaintenance'
 *     responses:
 *       200:
 *         description: Success updating the maintenance information of the salle.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/salleMaintenance'
 *       400:
 *         description: Invalid parameter or request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: salle not found
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
