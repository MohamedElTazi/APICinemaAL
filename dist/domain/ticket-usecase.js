"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketUsecase = void 0;
const ticket_1 = require("../database/entities/ticket");
const user_1 = require("../database/entities/user");
class TicketUsecase {
    constructor(db) {
        this.db = db;
    }
    listTickets(listTicketFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(ticket_1.Ticket, 'ticket');
            if (listTicketFilter.user) {
                query.andWhere('ticket.user = :user', { user: listTicketFilter.user });
            }
            if (listTicketFilter.is_used !== undefined) {
                query.andWhere('ticket.is_used = :is_used', { is_used: listTicketFilter.is_used });
            }
            if (listTicketFilter.is_super !== undefined) {
                query.andWhere('ticket.is_super = :is_super', { is_super: listTicketFilter.is_super });
            }
            if (listTicketFilter.price !== undefined) {
                query.andWhere('ticket.price = :price', { price: listTicketFilter.price });
            }
            if (listTicketFilter.nb_tickets !== undefined) {
                query.andWhere('ticket.nb_tickets = :nb_tickets', { nb_tickets: listTicketFilter.nb_tickets });
            }
            query.leftJoinAndSelect('ticket.user', 'user')
                .skip((listTicketFilter.page - 1) * listTicketFilter.limit)
                .take(listTicketFilter.limit);
            const [Tickets, totalCount] = yield query.getManyAndCount();
            return {
                Tickets,
                totalCount
            };
        });
    }
    getOneTicket(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(ticket_1.Ticket);
            const query = repo.createQueryBuilder("ticket")
                .leftJoinAndSelect("ticket.user", "user") // Effectuer une jointure avec la table des utilisateurs
                .where("ticket.id = :id", { id: id });
            // Exécuter la requête et récupérer le ticket avec les détails de l'utilisateur
            const ticket = yield query.getOne();
            // Vérifier si le ticket existe
            if (!ticket) {
                console.log({ error: `Ticket ${id} not found` });
                return null;
            }
            return ticket;
        });
    }
    updateTicket(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { user, is_used, is_super, price, nb_tickets }) {
            if (user === undefined && is_used === undefined && is_super === undefined && price === undefined && nb_tickets === undefined)
                return "No data to update";
            const repo = this.db.getRepository(ticket_1.Ticket);
            const ticketToUpdate = yield repo.findOneBy({ id });
            if (ticketToUpdate === null)
                return null;
            if (user !== null && user !== undefined) {
                ticketToUpdate.user = user;
            }
            if (is_used !== null && is_used !== undefined) {
                ticketToUpdate.is_used = is_used;
            }
            if (is_super !== null && is_super !== undefined) {
                ticketToUpdate.is_super = is_super;
            }
            if (price !== null && price !== undefined) {
                ticketToUpdate.price = price;
            }
            if (nb_tickets !== null && nb_tickets !== undefined) {
                ticketToUpdate.nb_tickets = nb_tickets;
            }
            const TicketUpdated = yield repo.save(ticketToUpdate);
            return TicketUpdated;
        });
    }
    getTicketsInfos() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db.getRepository(user_1.User);
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
            const tickets = yield entityManager.query(sqlQuery);
            return tickets;
        });
    }
    getTicketInfos(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityManager = this.db.getRepository(user_1.User);
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
            const ticket = yield entityManager.query(sqlQuery, [id]);
            return ticket;
        });
    }
}
exports.TicketUsecase = TicketUsecase;
