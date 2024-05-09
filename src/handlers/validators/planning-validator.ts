import Joi from "joi";
import { Planning } from "../../database/entities/planning";
import { Poste } from "../../database/entities/poste";
import { Employee } from "../../database/entities/employee";

export const createPlanningValidation = Joi.object<CreatePlanningValidationRequest>({
    poste: Joi.number ().required(),
    employee: Joi.number().required(),
    start_datetime: Joi.date().required(),
    end_datetime: Joi.date().required(),
}).options({ abortEarly: false });

export interface CreatePlanningValidationRequest {
    id: number
    poste: Poste
    employee: Employee
    start_datetime: Date
    end_datetime: Date
}

export const listPlanningValidation = Joi.object<ListPlanningRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    capacityMax: Joi.number().min(1).optional()
})

export interface ListPlanningRequest {
    page?: number
    limit?: number
    capacityMax?: number
}

export const planningIdValidation = Joi.object<PlanningIdRequest>({
    id: Joi.number().required(),
})

export interface PlanningIdRequest {
    id: number
}

export const updatePlanningValidation = Joi.object<UpdatePlanningRequest>({
    id: Joi.number().required(),
    poste: Joi.number ().optional(),
    employee: Joi.number().optional(),
    start_datetime: Joi.date().optional(),
    end_datetime: Joi.date().optional(),
})

export interface UpdatePlanningRequest {
    id: number
    poste: Poste
    employee?: Employee
    start_datetime: Date
    end_datetime: Date
}
