import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Token } from "./token"
import "reflect-metadata"
import { Ticket } from "./ticket"

export enum UserRole {
    User = "user",
    Administrator = "administrator",
}


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    email: string

    @Column()
    password: string

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.User
    })
    role: UserRole;

    @Column({type: "int", default:0})
    balance: number = 0

    @OneToMany(() => Ticket, ticket => ticket.user)
    tickets: Ticket[];

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];


    constructor(id: number, password: string, role: UserRole,balance: number, email: string, tokens: Token[],tickets: Ticket[]) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.balance = balance;
        this.tokens = tokens;
        this.tickets = tickets;
    }
}