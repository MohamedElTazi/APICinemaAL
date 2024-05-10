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
exports.Transaction = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const ticket_1 = require("./ticket");
const user_1 = require("./user");
var TransactionType;
(function (TransactionType) {
    TransactionType["buyTicket"] = "buy ticket";
    TransactionType["rechargeBalance"] = "recharge balance";
    TransactionType["withdrawBalance"] = "withdraw balance";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
let Transaction = class Transaction {
    constructor(id, ticket, user, transaction_type, amount, transaction_date) {
        this.id = id;
        this.ticket = ticket;
        this.user = user;
        this.transaction_type = transaction_type;
        this.amount = amount;
        this.transaction_date = transaction_date;
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.transactions),
    __metadata("design:type", user_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ticket_1.Ticket, ticket => ticket.transactions),
    __metadata("design:type", ticket_1.Ticket)
], Transaction.prototype, "ticket", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: TransactionType,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "transaction_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], Transaction.prototype, "transaction_date", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Number, ticket_1.Ticket, user_1.User, String, Number, Date])
], Transaction);
