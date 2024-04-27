"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPosteValidation = exports.updatePosteValidation = exports.posteIdValidation = exports.createPosteValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPosteValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.posteIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updatePosteValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
});
exports.listPosteValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    name: joi_1.default.string().optional()
});
