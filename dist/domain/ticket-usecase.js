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
class TicketUsecase {
    constructor(db) {
        this.db = db;
    }
    listTickets(listTicketFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(listTicketFilter);
            const query = this.db.createQueryBuilder(ticket_1.Ticket, 'Ticket');
            query.skip((listTicketFilter.page - 1) * listTicketFilter.limit);
            query.take(listTicketFilter.limit);
            const [Tickets, totalCount] = yield query.getManyAndCount();
            return {
                Tickets,
                totalCount
            };
        });
    }
}
exports.TicketUsecase = TicketUsecase;
