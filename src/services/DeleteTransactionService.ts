// import AppError from '../errors/AppError';

import { getCustomRepository } from "typeorm";
import TransactionsRepository from "../repositories/TransactionsRepository";

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    await transactionsRepository.delete(id);
    return
  }
}

export default DeleteTransactionService;
