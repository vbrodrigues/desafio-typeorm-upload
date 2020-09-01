import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import { In, getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import uploadConfig from '../config/upload';

interface Request {
  csvFilename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const filePath = path.join(uploadConfig.directory, csvFilename);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [ title, type, value, category ] = line;
      if (!title || !type || !value) return;
      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existantCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
      }
    });

    const existantCategoriesTitles = existantCategories.map((category: Category) => category.title);

    const nonExistantCategoriesTitles = categories
      .filter(category => !existantCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      nonExistantCategoriesTitles.map(title => ({ title }))
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [ ...newCategories, ...existantCategories ];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(category => category.title === transaction.category)
      }))
    );

    await transactionsRepository.save(createdTransactions);

    fs.promises.unlink(filePath);

    return createdTransactions;

  }
}

export default ImportTransactionsService;
