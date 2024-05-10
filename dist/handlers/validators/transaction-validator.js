"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionValidation = exports.transactionIdValidation = exports.useSuperTicketValidation = exports.buyTicketValidation = exports.updateMoneyValidation = exports.listTransactionValidation = exports.createTransactionValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createTransactionValidation = joi_1.default.object({
    user: joi_1.default.number().required(),
    ticket: joi_1.default.number().optional(),
    transaction_type: joi_1.default.string().valid('buy ticket', 'recharge balance', 'withdraw balance').required(),
    amount: joi_1.default.number().required(),
    transaction_date: joi_1.default.date().optional()
}).options({ abortEarly: false });
exports.listTransactionValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    capacityMax: joi_1.default.number().min(1).optional(),
    user: joi_1.default.number().optional(),
    ticket: joi_1.default.number().optional(),
    transaction_type: joi_1.default.string().valid('buy ticket', 'recharge balance', 'withdraw balance').optional(),
    amount: joi_1.default.number().optional(),
    transaction_date: joi_1.default.date().optional()
});
exports.updateMoneyValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    amount: joi_1.default.number().min(1).required()
});
exports.buyTicketValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    is_super: joi_1.default.boolean().required(),
    idShowtime: joi_1.default.number().optional()
});
exports.useSuperTicketValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    idTicket: joi_1.default.number().required(),
    idShowtime: joi_1.default.number().required()
});
exports.transactionIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updateTransactionValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    amount: joi_1.default.number().min(1).required()
});
