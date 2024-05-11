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
exports.TicketShowtimeAccessessHandler = void 0;
const generate_validation_message_1 = require("../validators/generate-validation-message");
const database_1 = require("../../database/database");
const ticketShowtimeAccesses_1 = require("../../database/entities/ticketShowtimeAccesses");
const ticketShowtimeAccesses_validator_1 = require("../validators/ticketShowtimeAccesses-validator");
const ticketShowtimeAccesses_usecase_1 = require("../../domain/ticketShowtimeAccesses-usecase");
const TicketShowtimeAccessessHandler = (app) => {
    app.get("/ticketShowtimeAccesses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validation = ticketShowtimeAccesses_validator_1.listAccessTicketShowTimeAccessesValidation.validate(req.query);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const listAcessTicketTicketShowTimeRequest = validation.value;
            let limit = 20;
            if (listAcessTicketTicketShowTimeRequest.limit) {
                limit = listAcessTicketTicketShowTimeRequest.limit;
            }
            const page = (_a = listAcessTicketTicketShowTimeRequest.page) !== null && _a !== void 0 ? _a : 1;
            const ticketAccessUsecase = new ticketShowtimeAccesses_usecase_1.TicketAccesUsecase(database_1.AppDataSource);
            const listTickets = yield ticketAccessUsecase.listTicketsAcces(Object.assign(Object.assign({}, listAcessTicketTicketShowTimeRequest), { page, limit }));
            res.status(200).send(listTickets);
        }
        catch (error) {
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }));
    app.get("/ticketShowtimeAccesses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ticketShowtimeAccesses_validator_1.ticketAccessIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const ticketAccessId = validationResult.value;
            const ticketAccesUsecase = new ticketShowtimeAccesses_usecase_1.TicketAccesUsecase(database_1.AppDataSource);
            const ticketAcces = yield ticketAccesUsecase.getOneTicketAcces(ticketAccessId.id);
            if (ticketAcces === null) {
                res.status(404).send({ "error": `ticketAcces ${ticketAccessId.id} not found` });
                return;
            }
            res.status(200).send(ticketAcces);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post("/ticketShowtimeAccesses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Validez les données de la requête
            const validation = ticketShowtimeAccesses_validator_1.accessTicketValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            // Récupérez les données validées
            const ticketShowtimeAccessRequest = validation.value;
            const ticketShowtimeAccessRepo = database_1.AppDataSource.getRepository(ticketShowtimeAccesses_1.TicketShowtimeAccesses);
            // Créez une nouvelle instance de TicketShowtimeAccesses à partir des données de la requête
            const newTicketShowtimeAccess = ticketShowtimeAccessRepo.create(ticketShowtimeAccessRequest);
            // Sauvegardez l'instance dans la base de données
            const savedTicketShowtimeAccess = yield ticketShowtimeAccessRepo.save(newTicketShowtimeAccess);
            // Envoyez la réponse avec le nouvel accès de ticket pour une séance créé
            res.status(201).send(savedTicketShowtimeAccess);
        }
        catch (error) {
            // Gérer les erreurs
            console.error("Error creating ticket showtime access:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }));
    app.patch("/ticketShowtimeAccesses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = ticketShowtimeAccesses_validator_1.updateTicketAccesValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const UpdateticketRequest = validation.value;
        try {
            const ticketAccesUsecase = new ticketShowtimeAccesses_usecase_1.TicketAccesUsecase(database_1.AppDataSource);
            const validationResult = ticketShowtimeAccesses_validator_1.ticketAccessIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const updateTicketAccess = yield ticketAccesUsecase.updateTicketAccess(UpdateticketRequest.id, Object.assign({}, UpdateticketRequest));
            if (updateTicketAccess === null) {
                res.status(404).send({ "error": `ticketAccess ${UpdateticketRequest.id} not found ` });
                return;
            }
            res.status(200).send(updateTicketAccess);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/ticketShowtimeAccesses/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ticketShowtimeAccesses_validator_1.ticketAccessIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const ticketId = validationResult.value;
            const MovieRepository = database_1.AppDataSource.getRepository(ticketShowtimeAccesses_1.TicketShowtimeAccesses);
            const ticket = yield MovieRepository.findOneBy({ id: ticketId.id });
            if (ticket === null) {
                res.status(404).send({ "error": `ticketAccess  ${ticketId.id} not found` });
                return;
            }
            const TicketDeleted = yield MovieRepository.remove(ticket);
            res.status(200).send("ticketAccess deleted");
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.TicketShowtimeAccessessHandler = TicketShowtimeAccessessHandler;
/**
 * @openapi
 *
 * components:
 *  schemas:
 *    TicketShowtimeAccesses:
 *      type: object
 *      properties:
 *        id:
 *          type: integer
 *          description: The id of the ticket showtime access
 *        ticketId:
 *          type: integer
 *          description: The id of the ticket
 *        showtimeId:
 *          type: integer
 *          description: The id of the showtime
 *
 */
/**
 * @openapi
 * /ticketShowtimeAccesses:
 *   get:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: List ticket showtime accesses
 *     description: Retrieve a list of ticket showtime accesses.
 *     responses:
 *       200:
 *         description: List of ticket showtime accesses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketShowtimeAccess'
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
 * /ticketShowtimeAccesses/{id}:
 *   get:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Get ticket showtime access by ID
 *     description: Retrieve a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket showtime access details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
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
 *         description: Ticket showtime access not found
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
 * /ticketShowtimeAccesses:
 *   post:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Create ticket showtime access
 *     description: Create a new ticket showtime access.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketShowtimeAccesses'
 *     responses:
 *       201:
 *         description: Ticket showtime access created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
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
 * /ticketShowtimeAccesses/{id}:
 *   patch:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Update ticket showtime access
 *     description: Update a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketShowtimeAccesses'
 *     responses:
 *       200:
 *         description: Updated ticket showtime access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketShowtimeAccess'
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
 *         description: Ticket showtime access not found
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
 * /ticketShowtimeAccesses/{id}:
 *   delete:
 *     tags:
 *       - Ticket_Showtime_Accesses
 *     summary: Delete ticket showtime access by ID
 *     description: Delete a ticket showtime access by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket showtime access deleted successfully
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
 *         description: Ticket showtime access not found
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
