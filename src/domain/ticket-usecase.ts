import { DataSource, SelectQueryBuilder } from "typeorm";
import { Ticket } from '../database/entities/ticket';
import { User } from '../database/entities/user';
import { Showtime } from '../database/entities/showtime';
import { TicketShowtimeAccesses } from '../database/entities/ticketShowtimeAccesses';

export interface ListTicketFilter {
    page: number
    limit: number
}
export interface ListTicketRequest {
    page?: number
    limit?: number
}

export interface UpdateTicketParams{
    user: User
    is_used: boolean
    is_super: boolean
    amount: number
    nb_tickets: number
}

export class TicketUsecase {
  
    constructor(private readonly db: DataSource) {}


    async listTickets(listTicketFilter: ListTicketFilter): Promise<{ Tickets: Ticket[], totalCount: number }> {
            console.log(listTicketFilter)
            const query = this.db.createQueryBuilder(Ticket, 'Ticket')
            query.skip((listTicketFilter.page - 1) * listTicketFilter.limit)
            query.take(listTicketFilter.limit)
    
            const [Tickets, totalCount] = await query.getManyAndCount()
            return {
                Tickets,
                totalCount
            }
        }

      
async updateTicket(id: number, {user,is_used, is_super, amount, nb_tickets}: UpdateTicketParams): Promise<Ticket | undefined> {
    const repo = this.db.getRepository(Ticket)
    const ticketToUpdate = await repo.findOneBy({id})
    if (!ticketToUpdate) return undefined

    if(user){
        ticketToUpdate.user = user
        ticketToUpdate.is_used = is_used
        ticketToUpdate.is_super = is_super
        ticketToUpdate.amount = amount
        ticketToUpdate.nb_tickets =  nb_tickets;
    }
    const MovieUpdated = await repo.save(ticketToUpdate)
    return MovieUpdated
}
}
