import Joi from "joi";

export const createPosteValidation = Joi.object<CreatePosteValidationRequest>({
    name: Joi.string().required(),
    description: Joi.string().required(),
}).options({ abortEarly: false });

export interface CreatePosteValidationRequest {
    name: string
    description: string
}

export const posteIdValidation = Joi.object<PosteIdRequest>({
    id: Joi.number().required(),
})

export interface PosteIdRequest {
    id: number
}
export const updatePosteValidation = Joi.object<UpdatePosteRequest>({
    id: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
})
export interface UpdatePosteRequest {
    id: number
    name: string
    description: string
}
export const listPosteValidation = Joi.object<ListPosteRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    name: Joi.string().optional()
})

export interface ListPosteRequest {
    page?: number
    limit?: number
    name: string
}