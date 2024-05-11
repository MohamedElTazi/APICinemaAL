import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:"varchar", length:255})
    token: string;

    @ManyToOne(() => User, user => user.tokens)
    user: User;

    constructor(id: number, token: string, user: User) {
        this.id = id
        this.token = token
        this.user = user
    }
}