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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const token_1 = require("./token");
require("reflect-metadata");
const ticket_1 = require("./ticket");
const transaction_1 = require("./transaction");
var UserRole;
(function (UserRole) {
    UserRole["User"] = "user";
    UserRole["Administrator"] = "administrator";
    UserRole["SuperAdministrator"] = "super_administrator";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
    constructor(id, firstname, lastname, password, role, balance, email, tokens, tickets, transactions) {
        this.balance = 0;
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role;
        this.balance = balance;
        this.tokens = tokens;
        this.tickets = tickets;
        this.transactions = transactions;
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: UserRole,
        default: UserRole.User
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_1.Ticket, ticket => ticket.user),
    __metadata("design:type", Array)
], User.prototype, "tickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => token_1.Token, token => token.user),
    __metadata("design:type", Array)
], User.prototype, "tokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_1.Transaction, transactions => transactions.user),
    __metadata("design:type", Array)
], User.prototype, "transactions", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Number, String, String, String, String, Number, String, Array, Array, Array])
], User);
