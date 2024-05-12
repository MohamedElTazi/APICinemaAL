"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sallePlanningValidation = exports.updateSalleMaintenanceValidation = exports.updateSalleValidation = exports.salleIdValidation = exports.listSalleValidation = exports.createSalleValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createSalleValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    type: joi_1.default.string().required(),
    capacity: joi_1.default.number().min(15).max(30).required(),
}).options({ abortEarly: false });
exports.listSalleValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    capacityMax: joi_1.default.number().min(1).optional()
});
exports.salleIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updateSalleValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    name: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    type: joi_1.default.string().optional(),
    capacity: joi_1.default.number().min(1).optional()
});
exports.updateSalleMaintenanceValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    maintenance_status: joi_1.default.boolean().required()
});
exports.sallePlanningValidation = joi_1.default.object({
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
});
