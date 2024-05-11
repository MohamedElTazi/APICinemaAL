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
exports.TicketHandler = void 0;
const ticket_validator_1 = require("../validators/ticket-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const database_1 = require("../../database/database");
const ticket_1 = require("../../database/entities/ticket");
const ticket_usecase_1 = require("../../domain/ticket-usecase");
const auth_middleware_1 = require("../middleware/auth-middleware");
const TicketHandler = (app) => {
    app.get("/tickets", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const validation = ticket_validator_1.listTicketValidation.validate(req.query);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            const listMovieRequest = validation.value;
            let limit = 20;
            if (listMovieRequest.limit) {
                limit = listMovieRequest.limit;
            }
            const page = (_a = listMovieRequest.page) !== null && _a !== void 0 ? _a : 1;
            const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
            const listTickets = yield ticketUsecase.listTickets(Object.assign(Object.assign({}, listMovieRequest), { page, limit }));
            res.status(200).send(listTickets);
        }
        catch (error) {
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }));
    app.get("/tickets/infos", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
        const query = yield ticketUsecase.getTicketsInfos();
        if (query === null) {
            res.status(404).send(Error("Error fetching planning"));
            return;
        }
        try {
            res.status(200).send(query);
        }
        catch (error) {
            console.error("Error fetching planning:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    app.get("/tickets/infos/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ticket_validator_1.ticketIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const ticketId = validationResult.value;
            const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
            let ticket = yield ticketUsecase.getTicketInfos(ticketId.id);
            if (ticket === null) {
                res.status(404).send({ "error": `movie ${ticketId.id} not found` });
                return;
            }
            if (ticket.length === 0) {
                const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
                ticket = yield ticketUsecase.getOneTicket(ticketId.id);
            }
            res.status(200).send(ticket);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.post("/tickets", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = ticket_validator_1.createTicketValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const ticketRequest = validation.value;
        console.log(ticketRequest);
        const ticketRepo = database_1.AppDataSource.getRepository(ticket_1.Ticket);
        try {
            const ticketCreated = yield ticketRepo.save(ticketRequest);
            res.status(201).send(ticketCreated);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/tickets/:id", auth_middleware_1.authMiddlewareAll, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ticket_validator_1.ticketIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const ticketId = validationResult.value;
            const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
            const ticket = yield ticketUsecase.getOneTicket(ticketId.id);
            if (ticket === null) {
                res.status(404).send({ "error": `ticket ${ticketId.id} not found` });
                return;
            }
            res.status(200).send(ticket);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.patch("/tickets/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const validation = ticket_validator_1.updateTicketValidation.validate(Object.assign(Object.assign({}, req.params), req.body));
        if (validation.error) {
            res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
            return;
        }
        const UpdateticketRequest = validation.value;
        try {
            const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
            const validationResult = ticket_validator_1.ticketIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const updatedTicket = yield ticketUsecase.updateTicket(UpdateticketRequest.id, Object.assign({}, UpdateticketRequest));
            if (updatedTicket === null) {
                res.status(404).send({ "error": `ticket ${UpdateticketRequest.id} not found ` });
                return;
            }
            if (updatedTicket === "No data to update") {
                res.status(400).send({ "error": `No data to update` });
                return;
            }
            res.status(200).send(updatedTicket);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.delete("/tickets/:id", auth_middleware_1.authMiddlewareAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const validationResult = ticket_validator_1.ticketIdValidation.validate(req.params);
            if (validationResult.error) {
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validationResult.error.details));
                return;
            }
            const ticketId = validationResult.value;
            const MovieRepository = database_1.AppDataSource.getRepository(ticket_1.Ticket);
            const ticket = yield MovieRepository.findOneBy({ id: ticketId.id });
            if (ticket === null) {
                res.status(404).send({ "error": `ticket  ${ticketId.id} not found` });
                return;
            }
            yield MovieRepository.remove(ticket);
            res.status(200).send("Successfully deleted");
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.TicketHandler = TicketHandler;
/**
 * @openapi
 *
 * components:
 *  schemas:
 *    Ticket:
 *     type: object
 *     required:
 *      - user_id
 *      - is_used
 *      - is_super
 *      - amount
 *      - nb_tickets
 *     properties:
 *      id:
 *       type: integer
 *       description: The auto-generated id of the ticket
 *      user_id:
 *       type: integer
 *       description: The id of the user who bought the ticket
 *      is_used:
 *       type: boolean
 *       description: The status of the ticket
 *      is_super:
 *       type: boolean
 *       description: The status of the ticket
 *      amount:
 *       type: number
 *       description: The price of the ticket
 *      nb_tickets:
 *       type: integer
 *       description: The number of tickets bought
 *
 * tags:
 *  name: Tickets
 */
/**
 * @openapi
 * /tickets:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get list of tickets
 *     description: Retrieve a list of tickets with optional pagination and filtering.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of tickets per page
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
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
 * /tickets/infos:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket information
 *     description: Retrieve information about tickets.
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketInfo'
 *       404:
 *         description: Tickets not found
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
 * /tickets/infos/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket information by ID
 *     description: Retrieve information about a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Create a new ticket
 *     description: Create a new ticket.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTicket'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 * /tickets/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket by ID
 *     description: Retrieve a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets/{id}:
 *   patch:
 *     tags:
 *       - Tickets
 *     summary: Update ticket by ID
 *     description: Update a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTicket'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
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
 *         description: Ticket not found
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
 * /tickets/{id}:
 *   delete:
 *     tags:
 *       - Tickets
 *     summary: Delete ticket by ID
 *     description: Delete a ticket by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Successfully deleted
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
 *         description: Ticket not found
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
