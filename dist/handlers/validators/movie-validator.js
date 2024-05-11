"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moviePlanningValidation = exports.listMovieValidation = exports.updateMovieValidation = exports.movieIdValidation = exports.createMovieValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createMovieValidation = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    duration: joi_1.default.date().required(),
    genre: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.movieIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updateMovieValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    duration: joi_1.default.number().optional(),
    genre: joi_1.default.string().optional(),
});
exports.listMovieValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    genre: joi_1.default.string().optional()
});
exports.moviePlanningValidation = joi_1.default.object({
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
});
