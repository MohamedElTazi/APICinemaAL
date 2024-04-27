"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMovieValidation = exports.userTicketsValidation = exports.accessTicketValidation = exports.createTicketValidation = void 0;
const joi_1 = __importDefault(require("joi"));
// Validation pour la création d'un billet (Ticket)
exports.createTicketValidation = joi_1.default.object({
    userId: joi_1.default.number().integer().required(),
    isSuper: joi_1.default.boolean().required(),
    amount: joi_1.default.number().integer().positive().required(),
    nbTickets: joi_1.default.number().integer().positive().optional(),
}).required();
// Validation pour l'accès à une séance avec un billet (Ticket)
exports.accessTicketValidation = joi_1.default.object({
    ticketId: joi_1.default.number().integer().required(),
    showtimeId: joi_1.default.number().integer().required(),
}).required();
// Validation pour récupérer les billets d'un utilisateur
exports.userTicketsValidation = joi_1.default.object({
    userId: joi_1.default.number().integer().required(),
}).required();
exports.listMovieValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
