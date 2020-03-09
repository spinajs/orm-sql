import { SqlWhereCompiler } from './compilers';
import { NewInstance } from "@spinajs/di";
import { BetweenStatement, JoinStatement, ColumnStatement, ColumnRawStatement, InStatement, IQueryStatementResult, RawQueryStatement, WhereStatement, ExistsQueryStatement, ColumnMethodStatement, WhereQueryStatement } from "@spinajs/orm";
import { WhereOperators } from '@spinajs/orm/lib/enums';

@NewInstance()
export class SqlRawStatement extends RawQueryStatement {
    public build(): IQueryStatementResult {
        return {
            Bindings: this._bindings,
            Statements: [`${this._query}`]
        }
    }
}

@NewInstance()
export class SqlBetweenStatement extends BetweenStatement {
    public build(): IQueryStatementResult {
        const exprr = this._not ? "NOT BETWEEN" : "BETWEEN";

        return {
            Bindings: this._val,
            Statements: [`\`${this._column}\` ${exprr} ? AND ?`]
        }
    }
}

@NewInstance()
export class SqlWhereStatement extends WhereStatement {
    public build(): IQueryStatementResult {

        const binding = this._operator === WhereOperators.NOT_NULL || this._operator === WhereOperators.NULL ? "" : " ?";
        return {
            Bindings: [this._value],
            Statements: [`\`${this._column}\` ${this._operator.toUpperCase()}${binding}`]
        }
    }
}

@NewInstance()
export class SqlJoinStatement extends JoinStatement {
    public build(): IQueryStatementResult {

        if(this._query){
            return {
                Bindings: this._query.Bindings,
                Statements: [`${this._method} ${this._query.Query}`]
            }
        }

        return {
            Bindings: [],
            Statements: [`${this._method} \`${this._table}\` ON ${this._primaryKey} = ${this._foreignKey}`]
        }
    }
}

@NewInstance()
export class SqlInStatement extends InStatement {
    public build(): IQueryStatementResult {
        const exprr = this._not ? "NOT IN" : "IN";

        return {
            Bindings: this._val,
            Statements: [`\`${this._column}\` ${exprr} (${this._val.map(_ => "?").join(",")})`]
        }
    }
}

@NewInstance()
export class SqlColumnStatement extends ColumnStatement {
    public build(): IQueryStatementResult {
        let exprr = "";

        if (this.IsWildcard) {
            exprr = "*";
        } else {

            exprr = `\`${this._column}\``;

            if (this._alias) {
                exprr += ` as \`${this._alias}\``
            }
        }

        return {
            Bindings: [],
            Statements: [exprr]
        }
    }
}

@NewInstance()
export class SqlColumnMethodStatement extends ColumnMethodStatement {
    public build(): IQueryStatementResult {
        let _exprr = "";

        if (this.IsWildcard) {
            _exprr = `${this._method}(${this._column})`;;
        } else {
            _exprr = `${this._method}(\`${this._column}\`)`;
        }

        if (this._alias) {
            _exprr += ` as \`${this._alias}\``
        }

        return {
            Bindings: [] as any[],
            Statements: [_exprr]
        }
    }
}

@NewInstance()
export class SqlColumnRawStatement extends ColumnRawStatement {
    public build(): IQueryStatementResult {
        return {
            Bindings: this.RawQuery.Bindings,
            Statements: [this.RawQuery.Query]
        }
    }
}

export class SqlWhereQueryStatement extends WhereQueryStatement {
    public build() {
        const _compiler = new SqlWhereCompiler();
        const _result = _compiler.where(this._builder);

        return {
            Bindings: _result.bindings,
            Statements: _result.expression && _result.expression !== "" ? [`( ${_result.expression} )`] : []
        }
    }
}

@NewInstance()
export class SqlExistsQueryStatement extends ExistsQueryStatement {
    public build(): IQueryStatementResult {
        let exprr = "";
        const compiled = this._builder.toDB();

        if (this._not) {
            exprr += `NOT EXISTS ( ${compiled.expression} )`
        } else {
            exprr += `EXISTS ( ${compiled.expression} )`;
        }

        return {
            Bindings: compiled.bindings,
            Statements: [exprr]
        };
    }
}