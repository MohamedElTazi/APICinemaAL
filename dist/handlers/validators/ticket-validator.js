"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketIdValidation = exports.updateTicketValidation = exports.listTicketValidation = exports.createTicketValidation = void 0;
const joi_1 = __importDefault(require("joi"));
/*    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT REFERENCES user(id),
    is_used BOOLEAN DEFAULT FALSE,
);
*/
// Validation pour la création d'un billet (Ticket)
exports.createTicketValidation = joi_1.default.object({
    user: joi_1.default.number().integer().required(),
    is_used: joi_1.default.boolean().required(),
    is_super: joi_1.default.boolean().required(),
    price: joi_1.default.number().required(),
    nb_tickets: joi_1.default.number().integer().positive().required()
}).required();
exports.listTicketValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    user: joi_1.default.number().optional(),
    is_used: joi_1.default.boolean().optional(),
    is_super: joi_1.default.boolean().optional(),
    price: joi_1.default.number().optional(),
    nb_tickets: joi_1.default.number().optional()
});
exports.updateTicketValidation = joi_1.default.object({
    id: joi_1.default.number().integer().required(),
    user: joi_1.default.number().integer().optional(),
    is_used: joi_1.default.boolean().optional(),
    is_super: joi_1.default.boolean().optional(),
    price: joi_1.default.number().optional(),
    nb_tickets: joi_1.default.number().optional()
});
exports.ticketIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
