import { SqlJoinStatement, SqlWithRecursiveStatement, SqlGroupByStatement, SqlDateTimeWrapper, SqlDateWrapper } from './../src/statements';
import { SqlOnDuplicateQueryCompiler, SqlIndexQueryCompiler, SqlWithRecursiveCompiler, SqlForeignKeyQueryCompiler, SqlGroupByCompiler } from './../src/compilers';
import { OrmDriver, IColumnDescriptor, InStatement, RawQueryStatement, BetweenStatement, WhereStatement, ColumnStatement, ColumnMethodStatement, ExistsQueryStatement, ColumnRawStatement, WhereQueryStatement, SelectQueryCompiler, UpdateQueryCompiler, DeleteQueryCompiler, InsertQueryCompiler, TableQueryCompiler, ColumnQueryCompiler, OrderByQueryCompiler, OnDuplicateQueryCompiler, JoinStatement, IndexQueryCompiler, RecursiveQueryCompiler, WithRecursiveStatement, ForeignKeyQueryCompiler, GroupByStatement, GroupByQueryCompiler, DateTimeWrapper, DateWrapper } from "@spinajs/orm";
import { IContainer } from "@spinajs/di";
import { SqlInStatement, SqlRawStatement, SqlBetweenStatement, SqlWhereStatement, SqlColumnStatement, SqlColumnMethodStatement, SqlExistsQueryStatement, SqlColumnRawStatement, SqlWhereQueryStatement } from "../src/statements";
import { SqlSelectQueryCompiler, SqlUpdateQueryCompiler, SqlDeleteQueryCompiler, SqlInsertQueryCompiler, SqlTableQueryCompiler, SqlColumnQueryCompiler, SqlOrderQueryByCompiler } from "../src/compilers";
import { Configuration } from "@spinajs/configuration";
import _ from "lodash";
import { join, normalize, resolve } from 'path';

export function dir(path: string) {
    return resolve(normalize(join(__dirname, path)));
}

// @ts-ignore
export class FakeSqliteDriver extends OrmDriver {

    public async execute(_stmt: string | object, _params?: any[]): Promise<any[] | any> {
        return true;
    }

    // tslint:disable-next-line: no-empty
    public async ping(): Promise<boolean> {
        return true;
    }

    // tslint:disable-next-line: no-empty
    public async connect(): Promise<OrmDriver> {
        return this;
    }

    // tslint:disable-next-line: no-empty
    public async disconnect(): Promise<OrmDriver> {
        return this;
    }

    public tableInfo(_table: string, _schema: string): Promise<IColumnDescriptor[]> {
        return null;
    }

    public resolve(container: IContainer) {
        super.resolve(container);

        this.Container = container.child();


        this.Container.register(SqlInStatement).as(InStatement);
        this.Container.register(SqlRawStatement).as(RawQueryStatement);
        this.Container.register(SqlBetweenStatement).as(BetweenStatement);
        this.Container.register(SqlWhereStatement).as(WhereStatement);
        this.Container.register(SqlJoinStatement).as(JoinStatement);
        this.Container.register(SqlColumnStatement).as(ColumnStatement);
        this.Container.register(SqlColumnMethodStatement).as(ColumnMethodStatement);
        this.Container.register(SqlExistsQueryStatement).as(ExistsQueryStatement);
        this.Container.register(SqlColumnRawStatement).as(ColumnRawStatement);
        this.Container.register(SqlWhereQueryStatement).as(WhereQueryStatement);
        this.Container.register(SqlWithRecursiveStatement).as(WithRecursiveStatement);
        this.Container.register(SqlGroupByStatement).as(GroupByStatement);
        this.Container.register(SqlDateTimeWrapper).as(DateTimeWrapper);
        this.Container.register(SqlDateWrapper).as(DateWrapper);


        this.Container.register(SqlWithRecursiveCompiler).as(RecursiveQueryCompiler);
        this.Container.register(SqlSelectQueryCompiler).as(SelectQueryCompiler);
        this.Container.register(SqlUpdateQueryCompiler).as(UpdateQueryCompiler);
        this.Container.register(SqlDeleteQueryCompiler).as(DeleteQueryCompiler);
        this.Container.register(SqlInsertQueryCompiler).as(InsertQueryCompiler);
        this.Container.register(SqlTableQueryCompiler).as(TableQueryCompiler);
        this.Container.register(SqlColumnQueryCompiler).as(ColumnQueryCompiler);
        this.Container.register(SqlOrderQueryByCompiler).as(OrderByQueryCompiler);
        this.Container.register(SqlOnDuplicateQueryCompiler).as(OnDuplicateQueryCompiler);
        this.Container.register(SqlIndexQueryCompiler).as(IndexQueryCompiler);
        this.Container.register(SqlForeignKeyQueryCompiler).as(ForeignKeyQueryCompiler);
        this.Container.register(SqlGroupByCompiler).as(GroupByQueryCompiler);

    }
}

export class ConnectionConf extends Configuration {

    protected conf = {
        system: {
            dirs: {
                models: [dir("./Models")],
            }
        },
        db: {
            Connections: [
                {
                    Driver: "sqlite",
                    Filename: "foo.sqlite",
                    Name: "sqlite"
                }
            ]
        }
    }

    public get(path: string[], defaultValue?: any): any {
        return _.get(this.conf, path, defaultValue);
    }

    // tslint:disable-next-line: no-empty
    public resolve() {

    }
}