import { InvalidOperationException } from "@spinajs/exceptions";
import { ColumnStatement, DeleteQueryBuilder, IColumnsBuilder, IColumnsCompiler, ICompilerOutput, ILimitBuilder, ILimitCompiler, InsertQueryBuilder, IOrderByBuilder, IOrderByCompiler, IWhereBuilder, IWhereCompiler, OrderByBuilder, QueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, SelectQueryCompiler, TableQueryCompiler, TableQueryBuilder, ColumnQueryBuilder, ColumnQueryCompiler, RawQuery, IQueryBuilder } from "@spinajs/orm";
import { use } from "typescript-mix";
import { NewInstance, Inject, Container } from "@spinajs/di";
import _ = require("lodash");

interface ITableAliasCompiler {
    tableAliasCompiler(builder: QueryBuilder): string;
}

class TableAliasCompiler implements ITableAliasCompiler {

    public tableAliasCompiler(builder: IQueryBuilder) {
        let table = "";

        if (builder.Schema) {
            table += `\`${builder.Schema}\`.`;
        }

        table += `\`${builder.Table}\``;


        if (builder.TableAlias) {
            table += ` as ${builder.TableAlias}`;
        }

        return table;
    }
}

@NewInstance()
export abstract class SqlQueryCompiler<T extends QueryBuilder> extends SelectQueryCompiler {
    protected _builder: T;

    constructor(builder: T) {
        super();

        if (!builder) {
            throw new InvalidOperationException('builder cannot be null or undefined');
        }

        this._builder = builder;
    }

    public abstract compile(): ICompilerOutput;
}

@NewInstance()
export class SqlOrderByCompiler implements IOrderByCompiler {
    public sort(builder: OrderByBuilder): ICompilerOutput {
        const sort = builder.getSort();
        let stmt = '';
        const bindings = [];

        if (sort) {
            stmt = ` ORDER BY ? ?`
            bindings.push(sort.column, sort.order);
        }

        return {
            bindings,
            expression: stmt,
        }
    }
}


@NewInstance()
export class SqlLimitCompiler implements ILimitCompiler {
    public limit(builder: ILimitBuilder): ICompilerOutput {
        const limits = builder.getLimits();
        const bindings = [];
        let stmt = '';

        if (limits.limit > 0) {
            stmt += ` LIMIT ?`
            bindings.push(limits.limit);
        } else {
            if (limits.offset > 0) {
                stmt += ` LIMIT 18446744073709551615`;
            }
        }

        if (limits.offset > 0) {
            stmt += ` OFFSET ?`;
            bindings.push(limits.offset);

        }

        return {
            bindings,
            expression: stmt
        }
    }
}

@NewInstance()
export class SqlColumnsCompiler implements IColumnsCompiler {
    public columns(builder: IColumnsBuilder) {
        return {
            bindings: [] as any[],
            expression: builder.getColumns().map(c => {
                return c.build().Statements[0];
            }).join(",")
        }
    }
}


@NewInstance()
export class SqlWhereCompiler implements IWhereCompiler {

    public where(builder: IWhereBuilder) {
        const where: string[] = [];
        const bindings: any[] = [];

        builder.Statements.map(x => {
            return x.build();
        }).forEach(r => {
            where.push(...r.Statements);

            if (Array.isArray(r.Bindings)) {
                bindings.push(...r.Bindings);
            }
        });

        return {
            bindings,
            expression: where.join(` ${builder.Op.toUpperCase()} `),
        }
    }
}


// tslint:disable-next-line
export interface SqlSelectQueryCompiler extends IWhereCompiler, ILimitCompiler, IOrderByCompiler, IColumnsCompiler, ITableAliasCompiler { }

@NewInstance()
export class SqlSelectQueryCompiler extends SqlQueryCompiler<SelectQueryBuilder> {

    @use(SqlWhereCompiler, SqlOrderByCompiler, SqlLimitCompiler, SqlColumnsCompiler, TableAliasCompiler)
    /// @ts-ignore
    private this: this;

    constructor(builder: SelectQueryBuilder) {
        super(builder);
    }


    public compile(): ICompilerOutput {
        const columns = this.select();
        const from = this.from();
        const limit = this.limit(this._builder as ILimitBuilder);
        const sort = this.sort(this._builder as IOrderByBuilder);
        const where = this.where(this._builder as IWhereBuilder);

        const expression = columns + " " + from + ((where.expression) ? ` WHERE ${where.expression}` : "") + limit.expression + sort.expression;

        const bindings = [];
        bindings.push(...where.bindings);
        bindings.push(...limit.bindings);
        bindings.push(...sort.bindings);

        return {
            bindings,
            expression: expression.trim()
        }
    }


    protected select() {

        let _stmt = "SELECT ";

        if (this._builder.IsDistinct) {
            _stmt += "DISTINCT "
        }

        if (this._builder.getColumns().length === 0) {
            return _stmt + '*';
        }

        return _stmt + this.columns(this._builder).expression;
    }

    protected from() {
        return "FROM " + this.tableAliasCompiler(this._builder);
    }
}

// tslint:disable-next-line
export interface SqlUpdateQueryCompiler extends IWhereCompiler, ITableAliasCompiler { };


@NewInstance()
export class SqlUpdateQueryCompiler extends SqlQueryCompiler<UpdateQueryBuilder>
{

    @use(SqlWhereCompiler, TableAliasCompiler)
    /// @ts-ignore
    private this: this

    constructor(builder: UpdateQueryBuilder) {
        super(builder);
    }

    public compile(): ICompilerOutput {

        const table = this.table();
        const set = this.set();
        const where = this.where(this._builder as IWhereBuilder);

        const bindings = [];
        bindings.push(...set.bindings);
        bindings.push(...where.bindings);

        return {
            bindings,
            expression: `${table} ${set.expression} WHERE ${where.expression}`
        }
    }

    protected set() {

        let bindings : any[] = [] 
        const exprr = [];

        for (const prop of Object.keys(this._builder.Value)) {
            const val = (this._builder.Value as any)[prop];

            exprr.push(`\`${prop}\` = ?`);
            bindings = bindings.concat(val);
        }

        return {
            bindings,
            expression: exprr.join(",")
        }
    }


    protected table() {
        return `UPDATE ${this.tableAliasCompiler(this._builder)} SET`;
    }

}

// tslint:disable-next-line
export interface SqlDeleteQueryCompiler extends IWhereCompiler, ITableAliasCompiler { }

@NewInstance()
export class SqlDeleteQueryCompiler extends SqlQueryCompiler<DeleteQueryBuilder>
{

    @use(SqlWhereCompiler, TableAliasCompiler)
    /// @ts-ignore
    private this: this;

    public compile() {

        const _bindings = [];
        const _from = this.from();
        const _limit = this.limit();
        const _where = this.where(this._builder as IWhereBuilder)

        let _expression = "";

        if (this._builder.Truncate) {
            _expression = `TRUNCATE TABLE ${this.tableAliasCompiler(this._builder)}`;
        } else {
            _expression = _from + ((_where.expression) ? ` WHERE ${_where.expression}` : "") + _limit.expression;
        }

        _bindings.push(..._where.bindings);
        _bindings.push(..._limit.bindings);

        return {
            bindings: _bindings,
            expression: _expression.trim()
        }
    }


    protected limit() {
        const _limits = this._builder.getLimits();
        const _bindings = [];
        let _stmt = ' ';

        if (_limits.limit > 0) {
            _stmt += `LIMIT ?`
            _bindings.push(_limits.limit);
        }

        return {
            bindings: _bindings,
            expression: _stmt
        }
    }


    protected from() {
        return `DELETE FROM ${this.tableAliasCompiler(this._builder)}`;
    }
}

@NewInstance()
export class SqlInsertQueryCompiler extends SqlQueryCompiler<InsertQueryBuilder> {

    public compile() {

        const into = this.into();
        const columns = this.columns();
        const values = this.values();

        return {
            bindings: values.bindings,
            expression: into + " " + columns + " " + values.data
        }
    }

    protected values() {
        const bindings: any[] = [];
        let data = "VALUES ";

        data += this._builder.Values.map(val => {
            const toInsert = val.map(v => {

                if (v === undefined) {
                    return "DEFAULT";
                }

                bindings.push(v);
                return "?";
            });
            return `(` + toInsert.join(",") + ")";
        }).join(",");

        return {
            bindings,
            data
        }
    }

    protected columns() {
        const columns = this._builder.getColumns().map(c => {
            return (c as ColumnStatement).Column
        }).map(c => {
            return `\`${c}\``;
        });

        return `(` + columns.join(",") + ")";
    }

    protected into() {
        return `INSERT INTO \`${this._builder.Table}\``;
    }
}

// tslint:disable-next-line
export interface SqlTableQueryCompiler extends ITableAliasCompiler { }

@NewInstance()
@Inject(Container)
export class SqlTableQueryCompiler extends TableQueryCompiler implements SqlTableQueryCompiler {

    @use(TableAliasCompiler)
    /// @ts-ignore
    private this: this;

    constructor(protected container : Container, protected builder: TableQueryBuilder) {
        super();
    }


    public compile(): ICompilerOutput {
        const _table = this._table();
        const _columns = this._columns();
        const _pkeys = this._primaryKeys();

        return {
            bindings: [],
            expression: `${_table} (${_columns} ${_pkeys})`
        }
    }

    protected _columns() {
        return this.builder.Columns.map((c) => {
            return this.container.resolve(ColumnQueryCompiler, [c]).compile().expression;
        }).join(",");
    }

    protected _primaryKeys() {

        const _keys = this.builder.Columns.filter(x => x.PrimaryKey).map(c => `\`${c.Name}\``).join(",");

        if (!_.isEmpty(_keys)) {
            return `, PRIMARY KEY (${_keys})`;
        }

        return "";

    }

    protected _table() {
        return `CREATE TABLE ${this.tableAliasCompiler(this.builder)}`;
    }

}

@NewInstance()
export class SqlColumnQueryCompiler implements ColumnQueryCompiler {

    constructor(protected builder: ColumnQueryBuilder) {

        if (!builder) {
            throw new Error("column query builder cannot be null");
        }
    }

    public compile(): ICompilerOutput {

        const _stmt: string[] = [];

        _stmt.push(`\`${this.builder.Name}\``);

        switch (this.builder.Type) {
            case "string":
                const _len = this.builder.Args[0] ? this.builder.Args[0] : 255;
                _stmt.push(`VARCHAR(${_len})`);
                break;
            case "boolean":
                _stmt.push(`TINYINT(1)`);
                break;
            case "float":
            case "double":
            case "decimal":
                const _precision = this.builder.Args[0] ? this.builder.Args[0] : 8;
                const _scale = this.builder.Args[1] ? this.builder.Args[1] : 2;
                _stmt.push(`${this.builder.Type.toUpperCase()}(${_precision},${_scale})`);
                break;
            case "enum":

                break;
            default:
                _stmt.push(this.builder.Type.toUpperCase());
                break;
        }

        if (this.builder.Unsigned) { _stmt.push("UNSIGNED"); }
        if (this.builder.Charset) { _stmt.push(`CHARACTER SET '${this.builder.Charset}'`); }
        if (this.builder.Collation) { _stmt.push(`COLLATE '${this.builder.Collation}'`); }
        if (this.builder.NotNull) { _stmt.push("NOT NULL"); }
        if (this.builder.Default) { _stmt.push(this._defaultCompiler()); }
        if(this.builder.AutoIncrement) {  _stmt.push("AUTO_INCREMENT"); }
        if(this.builder.Comment) { _stmt.push(`COMMENT '${this.builder.Comment}'`); }



        return {
            bindings: [],
            expression: _stmt.filter(x => !_.isEmpty(x)).join(" "),
        }
    }
 
    protected _defaultCompiler() {
        let _stmt = "";

        if (_.isNil(this.builder.Default) || (_.isString(this.builder.Default) && _.isEmpty(this.builder.Default.trim()))) {
            return _stmt;
        }

        if (_.isString(this.builder.Default)) {
            _stmt = `DEFAULT '${this.builder.Default.trim()}'`;
        } else if (_.isNumber(this.builder.Default)) {
            _stmt = `DEFAULT ${this.builder.Default}`;
        } else if (this.builder.Default instanceof RawQuery) {
            _stmt = `DEFAULT ${(this.builder.Default as RawQuery).Query}`;
        }

        return _stmt;
    }
}