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
    user?: User
    is_used?: boolean
    is_super?: boolean
    price?: number
    nb_tickets?: number
}


export class TicketUsecase {
  
    constructor(private readonly db: DataSource) {}


    async listTickets(listTicketFilter: ListTicketFilter): Promise<{ Tickets: Ticket[], totalCount: number }> {
            const query = this.db.createQueryBuilder(Ticket, 'ticket')
            .leftJoinAndSelect('ticket.user', 'user')
            .skip((listTicketFilter.page - 1) * listTicketFilter.limit)
            .take(listTicketFilter.limit);
    
            const [Tickets, totalCount] = await query.getManyAndCount()
            return {
                Tickets,
                totalCount
            }
    }

        async updateTicket(id: number, {user,is_used, is_super, price, nb_tickets}: UpdateTicketParams): Promise<Ticket | string |null> {


            if(user === undefined && is_used === undefined && is_super === undefined && price === undefined && nb_tickets === undefined) return "No data to update"


            const repo = this.db.getRepository(Ticket)
            const ticketToUpdate = await repo.findOneBy({id})
            if (ticketToUpdate === null) return null
        
            if(user !== null && user !== undefined){
                ticketToUpdate.user = user;
            }
            if(is_used !== null && is_used !== undefined){
                ticketToUpdate.is_used = is_used;
            }
            if(is_super !== null && is_super !== undefined){
                ticketToUpdate.is_super = is_super;
            }
            if(price !== null && price !== undefined){
                ticketToUpdate.price = price;
            }
            if(nb_tickets !== null && nb_tickets !== undefined){
                ticketToUpdate.nb_tickets = nb_tickets;
            }
            console.log("////////////////////",ticketToUpdate.nb_tickets)

            console.log(ticketToUpdate)
            const TicketUpdated = await repo.save(ticketToUpdate)
            return TicketUpdated
        }
    
}