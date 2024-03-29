import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Token } from "./token"
import "reflect-metadata"

export enum UserRole {
    User = "user",
    Administrator = "administrator",
}


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number

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

    @Column()
    balance: number

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];


    constructor(user_id: number, password: string, role: UserRole,balance: number, email: string, tokens: Token[]) {
        this.user_id = user_id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.balance = balance;
        this.tokens = tokens;
    }
}