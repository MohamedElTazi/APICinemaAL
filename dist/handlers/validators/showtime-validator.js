"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showtimePlanningValidation = exports.salleIdValidation = exports.updateShowtimeValidation = exports.showtimeIdValidation = exports.listShowtimeValidation = exports.createShowtimeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createShowtimeValidation = joi_1.default.object({
    salle: joi_1.default.number().required(),
    movie: joi_1.default.number().required(),
    start_datetime: joi_1.default.date().required().custom((value, helpers) => {
        const date = new Date(value);
        const dayOfWeek = date.getUTCDay();
        if (dayOfWeek < 1 || dayOfWeek > 5) {
            return helpers.error('Showtime must be scheduled from Monday to Friday.');
        }
        const time = date.getUTCHours();
        if (time < 9 || time > 19) {
            return helpers.error('Showtime must be scheduled from 9AM to 8PM.');
        }
        return value;
    }),
    special_notes: joi_1.default.string().required()
}).options({ abortEarly: false });
exports.listShowtimeValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
    salle: joi_1.default.number().optional(),
    movie: joi_1.default.number().optional(),
    start_datetime: joi_1.default.date().optional(),
    end_datetime: joi_1.default.date().optional(),
    special_notes: joi_1.default.string().optional()
});
exports.showtimeIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.updateShowtimeValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
    start_datetime: joi_1.default.date().optional().custom((value, helpers) => {
        console.log("value", value);
        const date = new Date(value);
        const dayOfWeek = date.getUTCDay();
        if (dayOfWeek < 1 || dayOfWeek > 5) {
            return helpers.error('Showtime must be scheduled from Monday to Friday.');
        }
        const time = date.getUTCHours();
        if (time < 9 || time > 20) {
            return helpers.error('Showtime must be scheduled from 9AM to 8PM.');
        }
        return value;
    }),
    end_datetime: joi_1.default.date().optional(),
    special_notes: joi_1.default.string().optional(),
    salle: joi_1.default.number().optional(),
    movie: joi_1.default.number().optional(),
});
exports.salleIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
exports.showtimePlanningValidation = joi_1.default.object({
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
});
