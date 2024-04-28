import { DataSource, DeleteResult } from "typeorm";
import { Token } from "../database/entities/token";

export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    async deleteToken(id: number): Promise<DeleteResult> {

        const TokenDelete = await this.db.createQueryBuilder().delete().from(Token).where("userId = :id", { id: id }).execute();

        return TokenDelete;

    }
    

}