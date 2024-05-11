import Joi from "joi";

export const createMovieValidation = Joi.object<CreateMovieValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.date().required(),
    genre: Joi.string().required(),
}).options({ abortEarly: false });

export interface CreateMovieValidationRequest {
    title: string
    description: string
    duration: string
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
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    duration: Joi.number().optional(),
    genre: Joi.string().optional(),
})

export interface UpdateMovieRequest {
    id: number
    title?: string
    description?: string
    duration?: string
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

export const moviePlanningValidation = Joi.object<MoviePlanningRequest>({
    startDate : Joi.date().optional(),
    endDate: Joi.date().optional(),

})

export interface MoviePlanningRequest {
    startDate?: Date
    endDate?: Date
}