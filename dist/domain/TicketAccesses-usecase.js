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
exports.TicketAccesUsecase = void 0;
const ticketShowtimeAccesses_1 = require("../database/entities/ticketShowtimeAccesses");
class TicketAccesUsecase {
    constructor(db) {
        this.db = db;
    }
    listTicketsAcces(listTicketAccesFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listTicketAccesFilter);
            const query = this.db.createQueryBuilder(ticketShowtimeAccesses_1.TicketShowtimeAccesses, 'TicketShowtimeAccesses');
            query.skip((listTicketAccesFilter.page - 1) * listTicketAccesFilter.limit);
            query.take(listTicketAccesFilter.limit);
            const [ticketShowtimeAccesses, totalCount] = yield query.getManyAndCount();
            console.log(ticketShowtimeAccesses);
            return {
                ticketShowtimeAccesses,
                totalCount
            };
        });
    }
    updateTicketAccess(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { ticket, showtime }) {
            const repo = this.db.getRepository(ticketShowtimeAccesses_1.TicketShowtimeAccesses);
            const ticketAccessToUpdate = yield repo.findOneBy({ id });
            if (!ticketAccessToUpdate)
                return undefined;
            if (id) {
                ticketAccessToUpdate.showtime = showtime;
                ticketAccessToUpdate.ticket = ticket;
            }
            const ticketAccessUpdated = yield repo.save(ticketAccessToUpdate);
            return ticketAccessUpdated;
        });
    }
}
exports.TicketAccesUsecase = TicketAccesUsecase;
