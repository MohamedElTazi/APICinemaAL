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
const TicketHandler = (app) => {
    app.get("/tickets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.get("/tickets/infos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.get("/tickets/infos/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.post("/tickets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.get("/tickets/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.patch("/tickets/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    app.delete("/tickets/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
