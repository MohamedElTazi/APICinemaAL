"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdValidation = exports.LoginUserValidation = exports.createUserValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserValidation = joi_1.default.object({
    firstname: joi_1.default.string().required(),
    lastname: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    role: joi_1.default.string().valid('user', 'administrator', 'super_administrator').required()
}).options({ abortEarly: false });
exports.LoginUserValidation = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.userIdValidation = joi_1.default.object({
    id: joi_1.default.number().required(),
});
