import Joi from "joi";
import { UserRole } from "../../database/entities/user";

export const createUserValidation = Joi.object<CreateUserValidationRequest>({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'administrator', 'super_administrator').required()
}).options({ abortEarly: false });

export interface CreateUserValidationRequest {
    firstname: string
    lastname: string
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
