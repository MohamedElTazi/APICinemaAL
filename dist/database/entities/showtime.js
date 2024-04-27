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
exports.Showtime = void 0;
const typeorm_1 = require("typeorm");
const salle_1 = require("./salle");
const movie_1 = require("./movie");
const ticketShowtimeAccesses_1 = require("./ticketShowtimeAccesses");
let Showtime = class Showtime {
    constructor(id, salle, movie, start_datetime, end_datetime, special_notes, ticket_showtime_accesses) {
        this.id = id;
        this.salle = salle;
        this.movie = movie;
        this.start_datetime = start_datetime;
        this.end_datetime = end_datetime;
        this.special_notes = special_notes;
        this.ticket_showtime_accesses = ticket_showtime_accesses;
    }
};
exports.Showtime = Showtime;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Showtime.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => salle_1.Salle, salle => salle.showtimes),
    __metadata("design:type", salle_1.Salle)
], Showtime.prototype, "salle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => movie_1.Movie, movie => movie.showtimes),
    __metadata("design:type", movie_1.Movie)
], Showtime.prototype, "movie", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Showtime.prototype, "start_datetime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Showtime.prototype, "end_datetime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Showtime.prototype, "special_notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticketShowtimeAccesses_1.TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket),
    __metadata("design:type", Array)
], Showtime.prototype, "ticket_showtime_accesses", void 0);
exports.Showtime = Showtime = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Number, salle_1.Salle, movie_1.Movie, Date, Date, String, Array])
], Showtime);
