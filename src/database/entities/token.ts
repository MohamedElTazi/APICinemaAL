import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    token_id: number;

    @Column({type:"varchar", length:255})
    token: string;

    @ManyToOne(() => User, user => user.tokens)
    @JoinColumn({ name: "user_id" })
    user: User;

    constructor(token_id: number, token: string, user: User) {
        this.token_id = token_id
        this.token = token
        this.user = user
    }
}