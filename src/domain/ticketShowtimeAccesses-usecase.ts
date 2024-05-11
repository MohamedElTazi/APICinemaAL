import { DataSource, SelectQueryBuilder } from "typeorm";
import { TicketShowtimeAccesses } from '../database/entities/ticketShowtimeAccesses';
import { User } from "../database/entities/user";
import { Showtime } from "../database/entities/showtime";
import { Ticket } from "../database/entities/ticket";

export interface ListTicketAccessFilter {
    page: number
    limit: number
    ticket?:number
    showtime?:number
}

export interface UpdateTicketAccessParams{
    id:number
    ticket: Ticket
    showtime : Showtime
}

export class TicketAccesUsecase {
  
    constructor(private readonly db: DataSource) {}


    async listTicketsAcces(listTicketAccesFilter: ListTicketAccessFilter): Promise<{ ticketShowtimeAccesses: TicketShowtimeAccesses[], totalCount: number }> {
            const query = this.db.createQueryBuilder(TicketShowtimeAccesses, 'ticketShowtimeAccesses')
            if(listTicketAccesFilter.ticket){
                query.andWhere('ticketShowtimeAccesses.ticket = :ticket', { ticket: listTicketAccesFilter.ticket })
            }
            if(listTicketAccesFilter.showtime){
                query.andWhere('ticketShowtimeAccesses.showtime = :showtime', { showtime: listTicketAccesFilter.showtime })
            }
            query.leftJoinAndSelect("ticketShowtimeAccesses.ticket", "ticket") 
            .leftJoinAndSelect("ticketShowtimeAccesses.showtime", "showtime") 
            .skip((listTicketAccesFilter.page - 1) * listTicketAccesFilter.limit)
            .take(listTicketAccesFilter.limit)
            
            const [ticketShowtimeAccesses, totalCount] = await query.getManyAndCount()
            return {
                ticketShowtimeAccesses,
                totalCount
            }
    }

    async getOneTicketAcces(id: number): Promise<TicketShowtimeAccesses | null> {
        const repo = this.db.getRepository(TicketShowtimeAccesses)
        const query = repo.createQueryBuilder("ticketShowtimeAccesses")
        .leftJoinAndSelect("ticketShowtimeAccesses.ticket", "ticket") 
        .leftJoinAndSelect("ticketShowtimeAccesses.showtime", "showtime") 
        .where("ticketShowtimeAccesses.id = :id", { id: id });

        // Exécuter la requête et récupérer le ticket avec les détails de l'utilisateur
        const ticketShowtimeAccesses = await query.getOne();

        // Vérifier si le ticket existe
        if (!ticketShowtimeAccesses) {
            console.log({ error: `TicketShowtimeAccesses ${id} not found` });
            return null;
        }
        return ticketShowtimeAccesses
    }

    async updateTicketAccess(id: number, {ticket, showtime}: UpdateTicketAccessParams): Promise<TicketShowtimeAccesses | undefined> {
        const repo = this.db.getRepository(TicketShowtimeAccesses)
        const ticketAccessToUpdate = await repo.findOneBy({id})
        if (!ticketAccessToUpdate) return undefined
    

        if(ticket){
            ticketAccessToUpdate.ticket = ticket
        }
        if(showtime){
            ticketAccessToUpdate.showtime = showtime
        }
        const ticketAccessUpdated = await repo.save(ticketAccessToUpdate)
        return ticketAccessUpdated
    }
    

}