import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export default class CreateForeignKeyTransactionsCategories1598915905250 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createForeignKey('transactions', new TableForeignKey({
            name: 'TransactionCategory',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
    }

}
