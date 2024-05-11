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
exports.TransactionUsecase = void 0;
const transaction_1 = require("../database/entities/transaction");
const user_1 = require("../database/entities/user");
const ticket_1 = require("../database/entities/ticket");
const ticket_validator_1 = require("../handlers/validators/ticket-validator");
const transaction_validator_1 = require("../handlers/validators/transaction-validator");
const ticketShowtimeAccesses_validator_1 = require("../handlers/validators/ticketShowtimeAccesses-validator");
const ticketShowtimeAccesses_1 = require("../database/entities/ticketShowtimeAccesses");
const showtime_1 = require("../database/entities/showtime");
const ticket_usecase_1 = require("./ticket-usecase");
class TransactionUsecase {
    constructor(db) {
        this.db = db;
    }
    updateTransaction(id_1, _a) {
        return __awaiter(this, arguments, void 0, function* (id, { amount }) {
            const repo = this.db.getRepository(transaction_1.Transaction);
            const Transactionfound = yield repo.findOneBy({ id });
            if (Transactionfound === null)
                return null;
            if (amount) {
                Transactionfound.amount = amount;
            }
            const TransactionUpdate = yield repo.save(Transactionfound);
            return TransactionUpdate;
        });
    }
    listTransaction(listTransactionFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(transaction_1.Transaction, 'transaction');
            if (listTransactionFilter.user) {
                query.andWhere('transaction.userId = :user', { user: listTransactionFilter.user });
            }
            if (listTransactionFilter.ticket) {
                query.andWhere('transaction.ticketId = :ticket', { ticket: listTransactionFilter.ticket });
            }
            if (listTransactionFilter.transaction_type) {
                query.andWhere('transaction.transaction_type = :transaction_type', { transaction_type: listTransactionFilter.transaction_type });
            }
            if (listTransactionFilter.amount) {
                query.andWhere('transaction.amount <= :amount', { capacityMax: listTransactionFilter.amount });
            }
            if (listTransactionFilter.transaction_date) {
                query.andWhere('transaction.transaction_date = :transaction_date', { transaction_date: listTransactionFilter.transaction_date });
            }
            query.leftJoinAndSelect('transaction.user', 'user')
                .leftJoinAndSelect('transaction.ticket', 'ticket')
                .skip((listTransactionFilter.page - 1) * listTransactionFilter.limit)
                .take(listTransactionFilter.limit);
            const [Transactions, totalCount] = yield query.getManyAndCount();
            return {
                Transactions,
                totalCount
            };
        });
    }
    getOneTransaction(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(transaction_1.Transaction);
            const query = repo.createQueryBuilder("transaction")
                .leftJoinAndSelect('transaction.user', 'user')
                .leftJoinAndSelect('transaction.ticket', 'ticket')
                .where("transaction.id = :id", { id: id });
            const transaction = yield query.getOne();
            if (!transaction) {
                console.log({ error: `Transaction ${id} not found` });
                return null;
            }
            return transaction;
        });
    }
    transaction(typeUpdate, id, amount, is_super, ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(user_1.User);
            const Userfound = yield repo.findOneBy({ id });
            if (Userfound === null)
                return null;
            let transaction_type;
            if (amount) {
                if (typeUpdate === 'withdraw') {
                    Userfound.balance -= amount;
                    transaction_type = 'withdraw balance';
                }
                else if (typeUpdate === 'add') {
                    Userfound.balance += amount;
                    transaction_type = 'recharge balance';
                }
                else {
                    if (is_super) {
                        Userfound.balance -= 80;
                        transaction_type = 'buy ticket';
                    }
                    else {
                        Userfound.balance -= 10;
                        transaction_type = 'buy ticket';
                    }
                }
            }
            const UserUpdate = yield repo.save(Userfound);
            yield this.createTransaction(id, transaction_type, amount, ticketId);
            return UserUpdate;
        });
    }
    useSuperTicket(id, idTicket, idShowtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const Userfound = yield userRepo.findOneBy({ id });
            if (Userfound === null)
                return "user not found";
            const ticketRepo = this.db.getRepository(ticket_1.Ticket);
            const Ticketfound = yield ticketRepo.findOneBy({ id: idTicket });
            if (Ticketfound === null)
                return "ticket not found";
            const showtimeRepo = this.db.getRepository(showtime_1.Showtime);
            const Showtimefound = yield showtimeRepo.findOneBy({ id: idShowtime });
            if (Showtimefound === null)
                return "showtime not found";
            if (Ticketfound.is_used && Ticketfound.nb_tickets === 0) {
                console.error('ticket is already used');
                return "ticket is already used";
            }
            else if (Ticketfound.nb_tickets === 0 && !Ticketfound.is_used || Ticketfound.nb_tickets !== 0 && Ticketfound.is_used) {
                console.error('ticket as problem');
                return "ticket as problem";
            }
            if (!Ticketfound.is_super) {
                console.error('ticket is not super');
                return "ticket is not super";
            }
            if ((yield this.verifDateShowtime(idShowtime)) === 0) {
                console.error('showtime is outdated');
                return "showtime is outdated";
            }
            this.creationTicketShowtimeAccesses(idTicket, idShowtime);
            let is_used = false;
            let nb_tickets = Ticketfound.nb_tickets - 1;
            if (Ticketfound.nb_tickets - 1 === 0) {
                is_used = true;
            }
            this.patchTicket(idTicket, is_used, nb_tickets);
            let response = "ok";
            return response;
        });
    }
    buyTicket(id, is_super, idShowtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoUser = this.db.getRepository(user_1.User);
            const Userfound = yield repoUser.findOneBy({ id });
            if (Userfound === null)
                return "user not found";
            const repoShowtime = this.db.getRepository(user_1.User);
            const Showtimefound = yield repoShowtime.findOneBy({ id: idShowtime });
            if (Showtimefound === null)
                return "showtime not found";
            let priceTicket;
            let nbTickets;
            if (is_super) {
                priceTicket = 80;
                nbTickets = 10;
            }
            else {
                if ((yield this.verifDateShowtime(idShowtime)) === 0) {
                    console.error('showtime is outdated');
                    return "showtime is outdated";
                }
                priceTicket = 10;
                nbTickets = 0;
            }
            if (Userfound.balance < priceTicket) {
                console.error('insufficient funds');
                return "insufficient funds";
            }
            const creationTicket = yield this.creationTicket(id, priceTicket, is_super, true, nbTickets);
            yield this.transaction("buy ticket", id, priceTicket, is_super, creationTicket);
            if (idShowtime !== 0) {
                this.creationTicketShowtimeAccesses(creationTicket, idShowtime);
            }
            let response = "ok";
            return response;
        });
    }
    createTransaction(id, transaction_type, amount, ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            let body;
            if (ticketId === 0) {
                body = {
                    user: id,
                    transaction_type: transaction_type,
                    amount: amount
                };
            }
            else {
                body = {
                    user: id,
                    transaction_type: transaction_type,
                    amount: amount,
                    ticket: ticketId
                };
            }
            const validation = transaction_validator_1.createTransactionValidation.validate(body);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                return validation.error.details.toString();
            }
            const transactionRequest = validation.value;
            const transactionRepo = this.db.getRepository(transaction_1.Transaction);
            try {
                const transactionCreated = yield transactionRepo.save(transactionRequest);
                console.log("TRANSACTION CREATED", transactionCreated);
                return transactionCreated.id;
            }
            catch (error) {
                console.log(error);
                return "Internal error";
            }
        });
    }
    creationTicket(id, price, is_super, is_used, nb_tickets) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                user: id,
                price: price,
                is_super: is_super,
                is_used: is_used,
                nb_tickets: nb_tickets
            };
            const validation = ticket_validator_1.createTicketValidation.validate(body);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                return "Validation error";
            }
            const ticketRequest = validation.value;
            const ticketRepo = this.db.getRepository(ticket_1.Ticket);
            try {
                const ticketCreated = yield ticketRepo.save(ticketRequest);
                console.log("TICKET CREATED", ticketCreated);
                return ticketCreated.id;
            }
            catch (error) {
                console.log(error);
                return "Internal error";
            }
        });
    }
    patchTicket(id, is_used, nb_tickets) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                is_used: is_used,
                nb_tickets: nb_tickets
            };
            const validation = ticket_validator_1.updateTicketValidation.validate(Object.assign({ id }, body));
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                return "Validation error";
            }
            const UpdateTicketRequest = validation.value;
            try {
                const ticketUsecase = new ticket_usecase_1.TicketUsecase(this.db);
                const updatedTicket = yield ticketUsecase.updateTicket(UpdateTicketRequest.id, Object.assign({}, UpdateTicketRequest));
                if (updatedTicket === null) {
                    console.log({ "error": `ticket ${UpdateTicketRequest.id} not found ` });
                    return "ticket not found";
                }
                console.log("TICKET UPDATE", updatedTicket);
                return updatedTicket;
            }
            catch (error) {
                console.log(error);
                return "Internal error";
            }
        });
    }
    creationTicketShowtimeAccesses(idTicket, idShowtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = {
                ticket: idTicket,
                showtime: idShowtime
            };
            const validation = ticketShowtimeAccesses_validator_1.createAccessTicketShowTimeAccessesValidation.validate(body);
            if (validation.error) {
                console.log('Validation error:', validation.error.details);
                return "Validation error";
            }
            const ticketShowtimeAccessesRequest = validation.value;
            const ticketShowtimeAccessesRepo = this.db.getRepository(ticketShowtimeAccesses_1.TicketShowtimeAccesses);
            try {
                const ticketShowtimeAccessesCreated = yield ticketShowtimeAccessesRepo.save(ticketShowtimeAccessesRequest);
                console.log("TicketShowtimeAccesses CREATED", ticketShowtimeAccessesCreated);
                return "ok";
            }
            catch (error) {
                console.log(error);
                return "Internal error";
            }
        });
    }
    verifDateShowtime(showtimeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.db.getRepository(showtime_1.Showtime)
                .createQueryBuilder('showtime')
                .where('start_datetime >= :currentDate', { currentDate: new Date() })
                .andWhere('id = :id', { id: showtimeId })
                .getCount();
            return count;
        });
    }
}
exports.TransactionUsecase = TransactionUsecase;
