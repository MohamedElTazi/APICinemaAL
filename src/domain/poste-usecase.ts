import { DataSource, Repository } from "typeorm";
import { Poste } from "../database/entities/poste";

export interface ListPosteFilter {
    page: number
    limit: number
}
export interface ListPosteRequest {
    page?: number
    limit?: number
}
export interface UpdatePosteParams {
    name: string
    description: string
}

export class PosteUsecase {
    constructor(private db: DataSource) {}
    async updatePoste(id: number, {name, description}: UpdatePosteParams): Promise<Poste | undefined> {
        const repo = this.db.getRepository(Poste)
        const posteToUpdate = await repo.findOneBy({id})
        if (!posteToUpdate) return undefined

        if(name){
            posteToUpdate.name = name
        }
        if(description){
            posteToUpdate.description = description
        }
        const PosteUpdated = await repo.save(posteToUpdate)
        return PosteUpdated
    }
    async listPoste(listPosteFilter: ListPosteFilter): Promise<{ Postes: Poste[]; totalCount: number; }> {
        console.log(listPosteFilter)
        const query = this.db.createQueryBuilder(Poste, 'Poste')
        query.skip((listPosteFilter.page - 1) * listPosteFilter.limit)
        query.take(listPosteFilter.limit)

        const [Postes, totalCount] = await query.getManyAndCount()
        return {
            Postes,
            totalCount
        }
    }


}