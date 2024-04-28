import Joi from 'joi';
import { User } from '../../database/entities/user';
/*    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT REFERENCES user(id),
    is_used BOOLEAN DEFAULT FALSE,
);
*/
// Validation pour la création d'un billet (Ticket)
export const createTicketValidation = Joi.object<CreateTicketValidationRequest>({
    user: Joi.number().integer().required(),
    is_used:Joi.boolean().required(),
    is_super: Joi.boolean().required(),
    price: Joi.number().required(),
    nb_tickets: Joi.number().integer().positive().required()
}).required();

export interface CreateTicketValidationRequest {
    user: User
    is_used: boolean
    is_super: boolean
    price: number
    nb_tickets: number
}


// Validation pour récupérer les billets d'un utilisateur
export const userTicketValidation = Joi.object({
    userId: Joi.number().integer().required(),
}).required();

export const listTicketValidation = Joi.object<ListTicketRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
  
})

export interface ListTicketRequest {
    page?: number
    limit?: number
 
}