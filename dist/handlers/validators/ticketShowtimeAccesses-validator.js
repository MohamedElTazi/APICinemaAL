"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessTicketValidation = exports.ticketAccessIdValidation = exports.updateTicketAccesValidation = exports.listAccessTicketShowTimeAccessesValidation = exports.createAccessTicketShowTimeAccessesValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createAccessTicketShowTimeAccessesValidation = joi_1.default.object({
    ticket: joi_1.default.number().required(),
    showtime: joi_1.default.number().integer().required(),
}).required();
exports.listAccessTicketShowTimeAccessesValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    ticket: joi_1.default.number().optional(),
    showtime: joi_1.default.number().optional(),
});
exports.updateTicketAccesValidation = joi_1.default.object({
    id: joi_1.default.number().integer().required(),
    ticket: joi_1.default.number().integer().required(),
    showtime: joi_1.default.number().required(),
});
exports.ticketAccessIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.accessTicketValidation = joi_1.default.object({
    ticket: joi_1.default.number().integer().required(),
    showtime: joi_1.default.number().integer().required(),
}).required();
