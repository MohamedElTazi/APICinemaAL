import { DataSource, SelectQueryBuilder } from "typeorm";
import { TicketShowtimeAccesses } from '../database/entities/ticketShowtimeAccesses';
import { User } from "../database/entities/user";
import { Showtime } from "../database/entities/showtime";
import { Ticket } from "../database/entities/ticket";

export interface ListTicketAccessFilter {
    page: number
    limit: number
}
export interface ListTicketAccessRequest {
    page?: number
    limit?: number
}
export interface UpdateTicketAccessParams{
    id:number
    ticket: Ticket
    showtime : Showtime
    
    }

export class TicketAccesUsecase {
  
    constructor(private readonly db: DataSource) {}


    async listTicketsAcces(listTicketAccesFilter: ListTicketAccessFilter): Promise<{ ticketShowtimeAccesses: TicketShowtimeAccesses[], totalCount: number }> {
            console.log(listTicketAccesFilter)
            const query = this.db.createQueryBuilder(TicketShowtimeAccesses, 'TicketShowtimeAccesses')
            query.skip((listTicketAccesFilter.page - 1) * listTicketAccesFilter.limit)
            query.take(listTicketAccesFilter.limit)
    
            const [ticketShowtimeAccesses, totalCount] = await query.getManyAndCount()
            console.log(ticketShowtimeAccesses)
            return {
                ticketShowtimeAccesses,
                totalCount
            }
        }
    async updateTicketAccess(id: number, { ticket, showtime}: UpdateTicketAccessParams): Promise<TicketShowtimeAccesses | undefined> {
        const repo = this.db.getRepository(TicketShowtimeAccesses)
        const ticketAccessToUpdate = await repo.findOneBy({id})
        if (!ticketAccessToUpdate) return undefined
    
        if(id){
            ticketAccessToUpdate.showtime = showtime
            ticketAccessToUpdate.ticket = ticket
        
        }
        const ticketAccessUpdated = await repo.save(ticketAccessToUpdate)
        return ticketAccessUpdated
    }
    

}
