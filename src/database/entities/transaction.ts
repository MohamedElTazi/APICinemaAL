import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Ticket } from "./ticket";
import { User } from "./user";

export enum TransactionType {
    buyTicket = "buy ticket",
    rechargeBalance = "recharge balance",
    withdrawBalance = "withdraw balance"
}

@Entity()
export class Transaction {    

        @PrimaryGeneratedColumn()
        id: number;
    
        @ManyToOne(() => User, user => user.transactions)
        user: User;

        @ManyToOne(() => Ticket, ticket => ticket.transactions)
        ticket: Ticket;

        @Column({
            type: "enum",
            enum: TransactionType,
        })
        transaction_type: TransactionType;

        @Column()
        amount: number;   

        @CreateDateColumn({type: "datetime"})
        transaction_date: Date; 
        constructor(id: number, ticket: Ticket, user: User, transaction_type:TransactionType, amount: number, transaction_date: Date) {
            this.id = id;
            this.ticket = ticket;
            this.user = user;
            this.transaction_type = transaction_type;
            this.amount = amount;
            this.transaction_date = transaction_date;
        }
}
