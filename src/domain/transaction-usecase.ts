import { DataSource } from "typeorm"
import { Transaction, TransactionType } from "../database/entities/transaction"
import { User } from "../database/entities/user"
import { Ticket } from "../database/entities/ticket"
import { createTicketValidation, ticketIdValidation, updateTicketValidation } from "../handlers/validators/ticket-validator"
import { createTransactionValidation } from "../handlers/validators/transaction-validator"
import { createAccessTicketShowTimeAccessesValidation } from "../handlers/validators/ticketShowtimeAccesses-validator"
import { TicketShowtimeAccesses } from "../database/entities/ticketShowtimeAccesses"
import { Showtime } from "../database/entities/showtime"
import { TicketUsecase } from "./ticket-usecase"

export interface UpdateTransactionParams {
    user?: User
    ticket?: Ticket
    transaction_type?: TransactionType
    amount?: number
    transaction_date?: Date

}

export interface ListTransactionFilter {
    limit: number
    page: number
    user?:number
    ticket?:number
    transaction_type?:TransactionType
    amount?:number
    transaction_date?: Date
}

export class TransactionUsecase {
    

    
   constructor(private readonly db: DataSource) { }


   async updateTransaction(id: number, { user,ticket,transaction_type,amount, transaction_date }: UpdateTransactionParams): Promise<Transaction | null> {
    const repo = this.db.getRepository(Transaction)
    const Transactionfound = await repo.findOneBy({ id })
    if (Transactionfound === null) return null

    if (user) {
        Transactionfound.user = user
    }
    if (ticket) {
        Transactionfound.ticket = ticket
    }
    if (transaction_type) {
        Transactionfound.transaction_type = transaction_type
    }
    if (transaction_date) {
        Transactionfound.transaction_date = transaction_date
    }
    if (amount) {
        Transactionfound.amount = amount
    }

    const TransactionUpdate = await repo.save(Transactionfound)
    return TransactionUpdate
}


   async listTransaction(listTransactionFilter: ListTransactionFilter): Promise<{ Transactions: Transaction[]; totalCount: number; }> {
    const query = this.db.createQueryBuilder(Transaction, 'transaction')
    if(listTransactionFilter.user){
        query.andWhere('transaction.userId = :user', { user: listTransactionFilter.user })
    }
    if(listTransactionFilter.ticket){
        query.andWhere('transaction.ticketId = :ticket', { ticket: listTransactionFilter.ticket })
    }
    if(listTransactionFilter.transaction_type){
        query.andWhere('transaction.transaction_type = :transaction_type', { transaction_type: listTransactionFilter.transaction_type })
    }
    if (listTransactionFilter.amount) {
        query.andWhere('transaction.amount <= :amount', { capacityMax: listTransactionFilter.amount })
    }
    if(listTransactionFilter.transaction_date){
        query.andWhere('transaction.transaction_date = :transaction_date', { transaction_date: listTransactionFilter.transaction_date })
    }
    query.leftJoinAndSelect('transaction.user', 'user')
    .leftJoinAndSelect('transaction.ticket', 'ticket')
    .skip((listTransactionFilter.page - 1) * listTransactionFilter.limit)
    .take(listTransactionFilter.limit)

    const [Transactions, totalCount] = await query.getManyAndCount()
    return {
        Transactions,
        totalCount
    }
}

async getOneTransaction(id: number): Promise<Transaction | null> {
    const repo = this.db.getRepository(Transaction)
    const query = repo.createQueryBuilder("transaction")
    .leftJoinAndSelect('transaction.user', 'user')
    .leftJoinAndSelect('transaction.ticket', 'ticket')
    .where("transaction.id = :id", { id: id });

    const transaction = await query.getOne();

    if (!transaction) {
        console.log({ error: `Transaction ${id} not found` });
        return null;
    }
    return transaction
}

    async transaction(typeUpdate:string, id: number, amount : number, is_super:boolean, ticketId:number): Promise<User | null> {
        const repo = this.db.getRepository(User)
        const Userfound = await repo.findOneBy({ id })
        if (Userfound === null) return null


        let transaction_type;
        if (amount) {
            if (typeUpdate === 'withdraw') {
                Userfound.balance -= amount
                transaction_type = 'withdraw balance'
            } else if (typeUpdate === 'add') {
                Userfound.balance  += amount
                transaction_type = 'recharge balance'
            }else{
                if(is_super) {
                    Userfound.balance -= 80
                    transaction_type = 'buy ticket'
                }else{
                    Userfound.balance -= 10
                    transaction_type = 'buy ticket'
                }
            } 
        }

        const UserUpdate = await repo.save(Userfound)
        
        await this.createTransaction(id, transaction_type as string, amount, ticketId)
        
        return UserUpdate
    }



    async useSuperTicket(id: number, idTicket:number, idShowtime:number): Promise<string> {

        const userRepo = this.db.getRepository(User)
        const Userfound = await userRepo.findOneBy({ id })
        if (Userfound === null) return "user not found"
            
        const ticketRepo = this.db.getRepository(Ticket)
        const Ticketfound = await ticketRepo.findOneBy({ id: idTicket })
        if (Ticketfound === null) return "ticket not found"

        const showtimeRepo = this.db.getRepository(Showtime)
        const Showtimefound = await showtimeRepo.findOneBy({ id: idShowtime })
        if (Showtimefound === null) return "showtime not found"



        if(Ticketfound.is_used && Ticketfound.nb_tickets === 0) {
            console.error('ticket is already used');
            return "ticket is already used"
        }else if(Ticketfound.nb_tickets === 0 && !Ticketfound.is_used || Ticketfound.nb_tickets !== 0 && Ticketfound.is_used){
            console.error('ticket as problem');
            return "ticket as problem"
        }

        if(!Ticketfound.is_super){
            console.error('ticket is not super');
            return "ticket is not super"
        }

        if(await this.verifDateShowtime(idShowtime) === 0){
            console.error('showtime is outdated');
            return "showtime is outdated"
        }

        this.creationTicketShowtimeAccesses(idTicket, idShowtime)

        let is_used = false
        let nb_tickets = Ticketfound.nb_tickets - 1
        if(Ticketfound.nb_tickets - 1 ===0){
            is_used = true
        }



        this.patchTicket(idTicket, is_used, nb_tickets)

        let response = "ok";
    
        return response

    }
    


    async buyTicket(id: number, is_super:boolean, idShowtime:number): Promise<string> {
        const repoUser = this.db.getRepository(User)
        const Userfound = await repoUser.findOneBy({ id })
        if (Userfound === null) return "user not found"

        const repoShowtime = this.db.getRepository(User)
        const Showtimefound = await repoShowtime.findOneBy({ id: idShowtime})

        if (Showtimefound === null) return "showtime not found"

        let priceTicket;
        let nbTickets
        if(is_super) {
            priceTicket = 80
            nbTickets = 10
        }else{
            if(await this.verifDateShowtime(idShowtime) === 0){
                console.error('showtime is outdated');
                return "showtime is outdated"
            }
            priceTicket = 10
            nbTickets = 0
        }

        if(Userfound.balance < priceTicket) {
            console.error('insufficient funds');
            return "insufficient funds"
        }


        const creationTicket = await this.creationTicket(id, priceTicket, is_super, true, nbTickets)
        
        await this.transaction("buy ticket", id, priceTicket, is_super, creationTicket as number)

        if(idShowtime !== 0){
            this.creationTicketShowtimeAccesses(creationTicket as number, idShowtime)
        }
        

        let response = "ok";

    
        return response
    }






    async createTransaction(id: number, transaction_type:string, amount:number, ticketId:number): Promise<string | number> {

        let body 
        if(ticketId === 0){
            body =  {
                user: id,
                transaction_type: transaction_type,
                amount: amount
            }
        }else{
            body =  {
                user: id,
                transaction_type: transaction_type,
                amount: amount,
                ticket: ticketId
            }
        }


        const validation = createTransactionValidation.validate(body)

        if (validation.error) {
            console.log('Validation error:', validation.error.details)
            return validation.error.details.toString()
        }

        const transactionRequest = validation.value
        const transactionRepo = this.db.getRepository(Transaction)
        try {
            const transactionCreated = await transactionRepo.save(
                transactionRequest
            )
            console.log("TRANSACTION CREATED",transactionCreated)
            return transactionCreated.id
        } catch (error) {
            console.log(error);
            return "Internal error" 
        }

    }

    async creationTicket(id: number, price:number, is_super:boolean, is_used:boolean, nb_tickets:number): Promise<string | number> {
        

        const body =  {
            user: id,
            price: price,
            is_super: is_super,
            is_used: is_used,
            nb_tickets: nb_tickets
        }

        const validation = createTicketValidation.validate(body)

        if (validation.error) {
            console.log('Validation error:', validation.error.details)
            return "Validation error"
        }

        const ticketRequest = validation.value
        const ticketRepo = this.db.getRepository(Ticket)
        try {
            const ticketCreated = await ticketRepo.save(
                ticketRequest
            )
            console.log("TICKET CREATED",ticketCreated)
            
            return ticketCreated.id
        } catch (error) {
            console.log(error);
            return "Internal error" 
        }
    }

    async patchTicket(id: number, is_used:boolean, nb_tickets:number): Promise<string | number> {
        
        const body =  {
            is_used: is_used,
            nb_tickets: nb_tickets
        }


        const validation = updateTicketValidation.validate({ id, ...body })

    
        if (validation.error) {
            console.log('Validation error:', validation.error.details)
            return "Validation error"
        }

        const UpdateTicketRequest = validation.value

    
        try {
            const ticketUsecase = new TicketUsecase(this.db);
    
            const updatedTicket = await ticketUsecase.updateTicket(UpdateTicketRequest.id,{ ...UpdateTicketRequest})

            if (updatedTicket === null) {
                console.log({ "error": `ticket ${UpdateTicketRequest.id} not found `})
                return "ticket not found"
            }

            console.log("TICKET UPDATE",updatedTicket)

            return updatedTicket as string
        } catch (error) {
            console.log(error);
            return "Internal error" 
        }
    }

    async creationTicketShowtimeAccesses(idTicket: number, idShowtime: number): Promise<string> {
        

        const body =  {
            ticket: idTicket,
            showtime: idShowtime
        }

        const validation = createAccessTicketShowTimeAccessesValidation.validate(body)

        if (validation.error) {
            console.log('Validation error:', validation.error.details)
            return "Validation error"
        }

        const ticketShowtimeAccessesRequest = validation.value
        const ticketShowtimeAccessesRepo = this.db.getRepository(TicketShowtimeAccesses)
        try {
            const ticketShowtimeAccessesCreated = await ticketShowtimeAccessesRepo.save(
                ticketShowtimeAccessesRequest
            )
            console.log("TicketShowtimeAccesses CREATED",ticketShowtimeAccessesCreated)
            
            return "ok"
        } catch (error) {
            console.log(error);
            return "Internal error" 
        }
    }
   
    async verifDateShowtime(showtimeId: number): Promise<number> {
        const count = await this.db.getRepository(Showtime)
        .createQueryBuilder('showtime')
        .where('start_datetime >= :currentDate', { currentDate: new Date() })
        .andWhere('id = :id', { id: showtimeId }) 
        .getCount();

        return count;
      }

}