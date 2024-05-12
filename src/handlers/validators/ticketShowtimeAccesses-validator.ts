import Joi from "joi";
import { Ticket } from "../../database/entities/ticket";
import { Showtime } from "../../database/entities/showtime";

export const createAccessTicketShowTimeAccessesValidation = Joi.object<AccessTicketShowTimeAccessesRequest>({
    ticket: Joi.number().required(),
    showtime: Joi.number().integer().required(),
}).required();

export interface AccessTicketShowTimeAccessesRequest {
    ticket: Ticket
    showtime: Showtime
}

export const listAccessTicketShowTimeAccessesValidation = Joi.object<ListAccessTicketShowTimeAccessesRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    ticket: Joi.number().optional(),
    showtime: Joi.number().optional(),
})


export interface ListAccessTicketShowTimeAccessesRequest {
    page?: number
    limit?: number
    ticket?:number
    showtime?:number
}

export const updateTicketAccesValidation = Joi.object<UpdateTicketAccesRequest>({
    id : Joi.number().integer().required(),
    ticket: Joi.number().integer().optional(),
    showtime:Joi.number().optional(),

})

export interface UpdateTicketAccesRequest {
    id : number
    ticket : Ticket;
    showtime :Showtime;

}


export const ticketAccessIdValidation = Joi.object<TicketAccessIdRequest>({
    id: Joi.number().required(),
})

export interface TicketAccessIdRequest {
    id: number
}

export const accessTicketValidation = Joi.object<TicketAccRequest>({
    ticket: Joi.number().integer().required(),
    showtime: Joi.number().integer().required(),
  
}).required();
export interface TicketAccRequest {
    ticket : Ticket;
    showtime :Showtime;
}
