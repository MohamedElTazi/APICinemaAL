import Joi from "joi";

export const createSalleValidation = Joi.object<CreateSalleValidationRequest>({
    name: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().required(),
    capacity: Joi.number().min(15).max(30).required(),
}).options({ abortEarly: false });

export interface CreateSalleValidationRequest {
    name: string
    description: string
    type: string
    capacity: number
}

