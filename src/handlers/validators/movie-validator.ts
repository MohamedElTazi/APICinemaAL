import Joi from "joi";

export const createMovieValidation = Joi.object<CreateMovieValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.number().required(),
    genre: Joi.string().required(),
}).options({ abortEarly: false });

export interface CreateMovieValidationRequest {
    title: string
    description: string
    duration: number
    genre: string
}

export const movieIdValidation = Joi.object<MovieIdRequest>({
    id: Joi.number().required(),
})

export interface MovieIdRequest {
    id: number
}

export const updateMovieValidation = Joi.object<UpdateMovieRequest>({
    id: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.number().required(),
    genre: Joi.string().required(),
})

export interface UpdateMovieRequest {
    id: number
    title: string
    description: string
    duration: number
    genre: string
}
export const listMovieValidation = Joi.object<ListMovieRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    genre: Joi.string().optional()
})

export interface ListMovieRequest {
    page?: number
    limit?: number
    genre: string
}