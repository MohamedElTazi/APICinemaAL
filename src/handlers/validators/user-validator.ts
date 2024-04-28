import Joi from "joi";
import { UserRole } from "../../database/entities/user";

export const createUserValidation = Joi.object<CreateUserValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'administrator').required()
}).options({ abortEarly: false });

export interface CreateUserValidationRequest {
    email: string
    password: string
    role:UserRole
}

export const LoginUserValidation = Joi.object<LoginUserValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).options({ abortEarly: false });

export interface LoginUserValidationRequest {
    email: string
    password: string
}

export const userIdValidation = Joi.object<UserIdRequest>({
    id: Joi.number().required(),
})

export interface UserIdRequest {
    id: number
}
