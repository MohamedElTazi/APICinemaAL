import Joi from "joi"
import { TransactionType } from "../../database/entities/transaction";
import { Ticket } from "../../database/entities/ticket";
import { User } from "../../database/entities/user";

export const createTransactionValidation = Joi.object<CreateTransactionRequest>({
    user: Joi.number().required(),
    ticket: Joi.number().optional(),
    transaction_type: Joi.string().valid('buy ticket', 'recharge balance', 'withdraw balance').required(),
    amount: Joi.number().required(),
    transaction_date: Joi.date().optional()
}).options({ abortEarly: false });

export interface CreateTransactionRequest {
    user: User
    ticket?: Ticket
    transaction_type: TransactionType
    amount: number
    transaction_date?: Date
}


export const listTransactionValidation = Joi.object<ListTransactionRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    capacityMax: Joi.number().min(1).optional(),
    user: Joi.number().optional(),
    ticket: Joi.number().optional(),
    transaction_type: Joi.string().valid('buy ticket', 'recharge balance', 'withdraw balance').optional(),
    amount: Joi.number().optional(),
    transaction_date: Joi.date().optional()
})

export interface ListTransactionRequest {
    page?: number
    limit?: number
    capacityMax?: number
    user?: number
    ticket?:number
    transaction_type?:TransactionType
    amount?:number
    transaction_date?: Date
}



export const updateMoneyValidation = Joi.object<UpdateMoneyRequest>({
    id: Joi.number().required(),
    amount: Joi.number().min(1).required()
})

export interface UpdateMoneyRequest {
    id: number
    amount: number
}

export const buyTicketValidation = Joi.object<BuyTicketRequest>({
    id: Joi.number().required(),
    is_super: Joi.boolean().required(),
    idShowtime: Joi.number().optional()
})

export interface BuyTicketRequest {
    id: number
    is_super: boolean,
    idShowtime?: number
}

export const useSuperTicketValidation = Joi.object<UseSuperTicketRequest>({
    id: Joi.number().required(),
    idTicket: Joi.number().required(),
    idShowtime: Joi.number().required()
})

export interface UseSuperTicketRequest {
    id: number
    idTicket: number,
    idShowtime: number
}

export const transactionIdValidation = Joi.object<TransactionIdRequest>({
    id: Joi.number().required(),
})

export interface TransactionIdRequest {
    id: number
}

export const updateTransactionValidation = Joi.object<UpdateTransactionRequest>({
    id: Joi.number().required(),
    user: Joi.number().optional(),
    ticket: Joi.number().optional(),
    transaction_type: Joi.string().valid('buy ticket', 'recharge balance', 'withdraw balance').optional(),
    transaction_date: Joi.date().optional(),
    amount: Joi.number().min(1).optional()})

export interface UpdateTransactionRequest {
    id: number
    user: User
    ticket: Ticket
    transaction_type: TransactionType
    amount: number
    transaction_date: Date
}