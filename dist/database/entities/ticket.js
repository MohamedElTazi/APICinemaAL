"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const ticketShowtimeAccesses_1 = require("./ticketShowtimeAccesses");
let Ticket = class Ticket {
    constructor(id, user, is_used, is_super, nb_tickets, ticket_showtime_accesses) {
        this.id = id;
        this.user = user;
        this.is_used = is_used;
        this.is_super = is_super;
        this.nb_tickets = nb_tickets;
        this.ticket_showtime_accesses = ticket_showtime_accesses;
    }
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.tokens),
    __metadata("design:type", user_1.User)
], Ticket.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Ticket.prototype, "is_used", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Ticket.prototype, "is_super", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ticket.prototype, "nb_tickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticketShowtimeAccesses_1.TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket),
    __metadata("design:type", Array)
], Ticket.prototype, "ticket_showtime_accesses", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Number, user_1.User, Boolean, Boolean, Number, Array])
], Ticket);
