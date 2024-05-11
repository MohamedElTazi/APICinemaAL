"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlanningValidation = exports.planningIdValidation = exports.listPlanningValidation = exports.createPlanningValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPlanningValidation = joi_1.default.object({
    poste: joi_1.default.number().required(),
    employee: joi_1.default.number().required(),
    start_datetime: joi_1.default.date().required(),
    end_datetime: joi_1.default.date().required(),
}).options({ abortEarly: false });
exports.listPlanningValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    capacityMax: joi_1.default.number().min(1).optional()
});
exports.planningIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updatePlanningValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    poste: joi_1.default.number().optional(),
    employee: joi_1.default.number().optional(),
    start_datetime: joi_1.default.date().optional(),
    end_datetime: joi_1.default.date().optional(),
});
