import Joi from "joi";
import { Poste } from "../../database/entities/poste";

export const createEmployeeValidation = Joi.object<CreateEmployeeValidationRequest>({
    name: Joi.string().required(),
    working_hours: Joi.string().required()
}).options({ abortEarly: false });

export interface CreateEmployeeValidationRequest {
    name: string
    working_hours: string
}

export const employeeIdValidation = Joi.object<EmployeeIdRequest>({
    id: Joi.number().required(),
})

export interface EmployeeIdRequest {
    id: number
}

export const listEmployeeValidation = Joi.object<ListEmployeeRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    name: Joi.string().optional()
})

export interface ListEmployeeRequest {
    page?: number
    limit?: number
    name: string
}

export const updateEmployeeValidation = Joi.object<UpdateEmployeeRequest>({
    id: Joi.number().required(),
    name: Joi.string().required(),
    working_hours: Joi.string().required(),
})
export interface UpdateEmployeeRequest {
    id: number
    name: string
    working_hours: string
}
