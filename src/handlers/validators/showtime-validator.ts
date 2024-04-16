import Joi from "joi";
import { Salle } from "../../database/entities/salle";
import { Movie } from "../../database/entities/movie";
import { Showtime } from "../../database/entities/showtime";

export const createShowtimeValidation = Joi.object<CreateShowtimeValidationRequest>({
    salle: Joi.number().required(),
    movie: Joi.number().required(),
    date: Joi.date().required(),
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
    special_notes : Joi.string().required()
}).options({ abortEarly: false });

export interface CreateShowtimeValidationRequest {
    id: number
    salle: Salle
    movie: Movie
    date: Date
    start_time: string
    end_time: string
    special_notes: string
}

export const listShowtimeValidation = Joi.object<ListShowtimeRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    capacityMax: Joi.number().min(1).optional()
})

export interface ListShowtimeRequest {
    page?: number
    limit?: number
    capacityMax?: number
}


export const showtimeIdValidation = Joi.object<ShowtimeIdRequest>({
    id: Joi.number().required(),
})

export interface ShowtimeIdRequest {
    id: number
}


export const updateShowtimeValidation = Joi.object<UpdateShowtimeRequest>({
    id: Joi.number().required(),
    special_notes: Joi.string().required()
})

export interface UpdateShowtimeRequest {
    id: number
    special_notes?: string
}


export const salleIdValidation = Joi.object<SalleIdRequest>({
    id: Joi.number().required(),
})

export interface SalleIdRequest {
    id: number
}

