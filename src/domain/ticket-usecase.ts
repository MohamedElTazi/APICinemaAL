import { DataSource, SelectQueryBuilder } from "typeorm";
import { Ticket } from '../database/entities/ticket';
import { User } from '../database/entities/user';
import { Showtime } from '../database/entities/showtime';
import { TicketShowtimeAccesses } from '../database/entities/ticketShowtimeAccesses';

export interface ListTicketFilter {
    page: number
    limit: number
    user?: number;
    is_used?: boolean;
    is_super?: boolean;
    price?: number;
    nb_tickets?: number;
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

                if(listTicketFilter.user){
                    query.andWhere('ticket.user = :user', { user: listTicketFilter.user })
                }

                if(listTicketFilter.is_used !== undefined){
                    query.andWhere('ticket.is_used = :is_used', { is_used: listTicketFilter.is_used })
                }

                if(listTicketFilter.is_super !== undefined){
                    query.andWhere('ticket.is_super = :is_super', { is_super: listTicketFilter.is_super })
                }

                if(listTicketFilter.price !== undefined){
                    query.andWhere('ticket.price = :price', { price: listTicketFilter.price })
                }

                if(listTicketFilter.nb_tickets !== undefined){
                    query.andWhere('ticket.nb_tickets = :nb_tickets', { nb_tickets: listTicketFilter.nb_tickets })
                }
                
                query.leftJoinAndSelect('ticket.user', 'user')
                .skip((listTicketFilter.page - 1) * listTicketFilter.limit)
                .take(listTicketFilter.limit);
        
                const [Tickets, totalCount] = await query.getManyAndCount()
                return {
                    Tickets,
                    totalCount
                }
        }

        async getOneTicket(id: number): Promise<Ticket | null> {
            const repo = this.db.getRepository(Ticket)
            const query = repo.createQueryBuilder("ticket")
            .leftJoinAndSelect("ticket.user", "user") // Effectuer une jointure avec la table des utilisateurs
            .where("ticket.id = :id", { id: id });

            // Exécuter la requête et récupérer le ticket avec les détails de l'utilisateur
            const ticket = await query.getOne();

            // Vérifier si le ticket existe
            if (!ticket) {
                console.log({ error: `Ticket ${id} not found` });
                return null;
            }
            return ticket
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

            const TicketUpdated = await repo.save(ticketToUpdate)
            return TicketUpdated
        }

            
    async getTicketsInfos(): Promise<any | null>{

        const entityManager = this.db.getRepository(User);

        const sqlQuery = `
        SELECT 
            ticket.id, 
            ticket.is_used, 
            ticket.is_super, 
            ticket.price, 
            ticket.nb_tickets, 
            movie.title, 
            showtime.start_datetime, 
            showtime.end_datetime, 
            showtime.special_notes 
        FROM 
            ticket 
        INNER JOIN 
            ticket_showtime_accesses 
        ON 
            ticket.id = ticket_showtime_accesses.ticketId 
        INNER JOIN 
            showtime 
        ON 
            showtime.id = ticket_showtime_accesses.showtimeId 
        INNER JOIN 
            movie 
        ON 
            movie.id = showtime.movieId;
        `;
        
        const tickets = await entityManager.query(sqlQuery);
        
        return tickets;

    }


    async getTicketInfos(id: number): Promise<any | null> {
        const entityManager = this.db.getRepository(User);
    
        const sqlQuery = `
        SELECT 
            ticket.id, 
            ticket.is_used, 
            ticket.is_super, 
            ticket.price, 
            ticket.nb_tickets, 
            movie.title, 
            showtime.start_datetime, 
            showtime.end_datetime, 
            showtime.special_notes 
        FROM 
            ticket 
        INNER JOIN 
            ticket_showtime_accesses 
        ON 
            ticket.id = ticket_showtime_accesses.ticketId 
        INNER JOIN 
            showtime 
        ON 
            showtime.id = ticket_showtime_accesses.showtimeId 
        INNER JOIN 
            movie 
        ON 
            movie.id = showtime.movieId
        WHERE ticket.id = ?;
        `;
    
        const ticket = await entityManager.query(sqlQuery, [id]);
    
        return ticket;
    }
    


    
}