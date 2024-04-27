import Joi from 'joi';
/*    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT REFERENCES user(id),
    is_used BOOLEAN DEFAULT FALSE,
);
*/
// Validation pour la création d'un billet (Ticket)
export const createTicketValidation = Joi.object({
    userId: Joi.number().integer().required(),
    isSuper: Joi.boolean().required(),
    prix: Joi.number().integer().positive().required(),
    nbTickets: Joi.number().integer().positive().optional(),
    is_used:Joi.boolean().required(),
}).required();

// Validation pour l'accès à une séance avec un billet (Ticket)
export const accessTicketValidation = Joi.object({
    ticketId: Joi.number().integer().required(),
    showtimeId: Joi.number().integer().required(),
}).required();

// Validation pour récupérer les billets d'un utilisateur
export const userTicketsValidation = Joi.object({
    userId: Joi.number().integer().required(),
}).required();

export const listMovieValidation = Joi.object<ListTicketRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
  
})

export interface ListTicketRequest {
    page?: number
    limit?: number
 
}