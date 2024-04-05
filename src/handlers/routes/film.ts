import express from "express"

export const SalleHandler = (app: express.Express) => {
   

    app.post("/salles",authMiddlewareAdmin ,async (req: Request, res: Response) => {
        console.log(UserHandler.name)
        const validation = createSalleValidation.validate(req.body)

        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details))
            return
        }

        const salleRequest = validation.value
        const salleRepo = AppDataSource.getRepository(Salle)
        try {

            const salleCreated = await salleRepo.save(
                salleRequest
            )
            res.status(201).send(salleCreated)
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" })
        }
    })

}