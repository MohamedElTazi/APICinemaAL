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