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
    amount?: number
    nb_tickets?: number
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

//createTicket
   
}
