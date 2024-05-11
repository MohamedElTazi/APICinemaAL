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
exports.ticketHandler = void 0;
const ticket_validator_1 = require("../validators/ticket-validator");
const generate_validation_message_1 = require("../validators/generate-validation-message");
const ticket_usecase_1 = require("../../domain/ticket-usecase");
const database_1 = require("../../database/database");
const ticketHandler = (app) => {
    app.get("/tickets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Validation de la requête
            const validation = ticket_validator_1.listMovieValidation.validate(req.query);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                res.status(400).send((0, generate_validation_message_1.generateValidationErrorMessage)(validation.error.details));
                return;
            }
            // Diagnostic : affiche les valeurs des variables
            console.log('Requête valide:', req.query);
            const listMovieRequest = validation.value;
            let limit = 20;
            if (listMovieRequest.limit) {
                limit = listMovieRequest.limit;
                console.log('Limite:', limit);
            }
            const page = (_a = listMovieRequest.page) !== null && _a !== void 0 ? _a : 1;
            console.log('Page:', page);
            // Création de l'instance de TicketUsecase
            const ticketUsecase = new ticket_usecase_1.TicketUsecase(database_1.AppDataSource);
            console.log('TicketUsecase créé.');
            // Appel de la méthode listTickets
            const listTickets = yield ticketUsecase.listTickets(Object.assign(Object.assign({}, listMovieRequest), { page, limit }));
            console.log('ListTickets récupéré:', listTickets);
            // Envoi de la réponse
            res.status(200).send(listTickets);
        }
        catch (error) {
            // Gestion des erreurs
            console.log('Erreur lors de la récupération des tickets:', error);
            res.status(500).send({ error: 'Internal server error' });
        }
    }));
};
exports.ticketHandler = ticketHandler;
