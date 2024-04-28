import Joi from 'joi';
import { User } from '../../database/entities/user';
import { Ticket } from '../../database/entities/ticket';
import { Showtime } from '../../database/entities/showtime';

export const createTicketValidation = Joi.object<CreateTicketValidationRequest>({
    user: Joi.number().integer().required(),
    is_used:Joi.boolean().required(),
    is_super: Joi.boolean().required(),
    amount: Joi.number().required(),
    nb_tickets: Joi.number().integer().positive().required()
}).required();

export interface CreateTicketValidationRequest {
    user: User
    is_used: boolean
    is_super: boolean
    amount: number
    nb_tickets: number
}



// Validation pour récupérer les billets d'un utilisateur
export const userTicketsValidation = Joi.object({
    user: Joi.number().integer().required(),
}).required();

export const listTicketValidation = Joi.object<ListTicketRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
  
})


export interface ListTicketRequest {
    page?: number
    limit?: number
 
}

export const ticketIdValidation = Joi.object<TicketIdRequest>({
    id: Joi.number().required(),
})

export interface TicketIdRequest {
    id: number
}



export const updateTicketValidation = Joi.object<UpdateTicketRequest>({
    id : Joi.number().integer().required(),
    user: Joi.number().integer().required(),
    is_used:Joi.boolean().required(),
    is_super: Joi.boolean().required(),
    amount: Joi.number().required(),
    nb_tickets: Joi.number().integer().positive().required()
})

export interface UpdateTicketRequest {
    id : number
    user: User
    is_used: boolean
    is_super: boolean
    amount: number
    nb_tickets: number
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////:

export const listaccessTicketValidation = Joi.object<ListaccessTicketRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
  
})


export interface ListaccessTicketRequest {
    page?: number
    limit?: number
 
}


export const updateTicketAccesValidation = Joi.object<UpdateTicketAccesRequest>({
    id : Joi.number().integer().required(),
    ticket: Joi.number().integer().required(),
    showtime:Joi.number().required(),

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

