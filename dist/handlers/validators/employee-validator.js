"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeValidation = exports.listEmployeeValidation = exports.employeeIdValidation = exports.createEmployeeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createEmployeeValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.employeeIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.listEmployeeValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    name: joi_1.default.string().optional()
});
exports.updateEmployeeValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    name: joi_1.default.string().required(),
});
