import { IndexQueryBuilder, ReferentialAction } from '@spinajs/orm';
import { expect } from 'chai';
import 'mocha';
import { SelectQueryBuilder, SchemaQueryBuilder, DeleteQueryBuilder, InsertQueryBuilder, RawQuery, TableQueryBuilder, Orm, IWhereBuilder } from '@spinajs/orm';
import { DI } from '@spinajs/di';
import { Configuration } from "@spinajs/configuration";
import { SpinaJsDefaultLog, LogModule } from "@spinajs/log";
import { ConnectionConf, FakeSqliteDriver } from './fixture';
import { RelationModel } from './Models/RelationModel';
import sinon from 'sinon';
import { RelationModel3 } from './Models/RelationModel3';




function sqb() {
    const connection = db().Connections.get("sqlite");
    return connection.Container.resolve(SelectQueryBuilder, [connection]);
}

function dqb() {
    const connection = db().Connections.get("sqlite");
    return connection.Container.resolve(DeleteQueryBuilder, [connection]);
}


function iqb() {
    const connection = db().Connections.get("sqlite");
    return connection.Container.resolve(InsertQueryBuilder, [connection]);
}

function schqb() {
    const connection = db().Connections.get("sqlite");
    return connection.Container.resolve(SchemaQueryBuilder, [connection]);
}

function inqb() {
    const connection = db().Connections.get("sqlite");
    return connection.Container.resolve(IndexQueryBuilder, [connection]);
}

function db() {
    return DI.get(Orm);
}

describe("Query builder generic", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });


    it("clear columns", async () => {
        const result = sqb().select("a").select("b").from("users").clearColumns().toDB();
        expect(result.expression).to.equal("SELECT * FROM `users`");
    })

    it("throw on invalid table", () => {
        expect(() => {
            sqb().select("*").from("");
        }).to.throw();

        expect(() => {
            sqb().select("*").from("  ");
        }).to.throw();

    })

    it("set & get schema", () => {
        const query = sqb().select("*").from("users").schema("spine");

        expect(query.Schema).to.equal("spine");
        expect(query.toDB().expression).to.equal("SELECT * FROM `spine`.`users`");
    })

    it("set & get alias", () => {
        const query = sqb().select("*").from("users", "u");

        expect(query.TableAlias).to.equal("u");
        expect(query.toDB().expression).to.equal("SELECT `u`.* FROM `users` as `u`");
    })

    it("ensure table presents", () => {
        const table = "";

        expect(() => {
            sqb().select("*").from(table).toDB();
        }).to.throw();

        expect(() => {
            sqb().select("*").from(null).toDB();
        }).to.throw();
    })

    it("ensure schema presents", () => {
        const schema = "";

        expect(() => {
            sqb().select("*").from("users").schema(schema).toDB();
        }).to.throw();

        expect(() => {
            sqb().select("*").from("users").schema(null).toDB();
        }).to.throw();
    })
})

describe("Where query builder", () => {


    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("left join", () => {
        const result = sqb().select("*").from("users").leftJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LEFT JOIN `adresses` ON id = addressId");
    })

    it("right join", () => {
        const result = sqb().select("*").from("users").rightJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` RIGHT JOIN `adresses` ON id = addressId");
    })

    it("left outer join", () => {
        const result = sqb().select("*").from("users").leftOuterJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LEFT OUTER JOIN `adresses` ON id = addressId");
    })

    it("inner join", () => {
        const result = sqb().select("*").from("users").innerJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` INNER JOIN `adresses` ON id = addressId");
    })

    it("right outer join", () => {
        const result = sqb().select("*").from("users").rightOuterJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` RIGHT OUTER JOIN `adresses` ON id = addressId");
    })

    it("full outer join", () => {
        const result = sqb().select("*").from("users").fullOuterJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` FULL OUTER JOIN `adresses` ON id = addressId");
    })

    it("cross join", () => {
        const result = sqb().select("*").from("users").crossJoin("adresses", "addressId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` CROSS JOIN `adresses` ON id = addressId");
    })

    it("multiple joins", () => {
        const result = sqb().select("*").from("users").leftJoin("adresses", "addressId", "id").leftJoin("account", "accountId", "id").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LEFT JOIN `adresses` ON id = addressId LEFT JOIN `account` ON id = accountId");
    })

    it("raw query joins", () => {
        const result = sqb().select("*").from("users").leftJoin(new RawQuery("client ON foo=bar")).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LEFT JOIN client ON foo=bar");
    })

    it("clear where", () => {
        const result = sqb().select("*").from("users").where('id', "=", 1).clearWhere().toDB();
        expect(result.expression).to.equal("SELECT * FROM `users`");
    })

    it("where exists", () => {
        const result = sqb().select("*").from("users").whereExist(sqb().where("id", 1).from("comments")).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE EXISTS ( SELECT * FROM `comments` WHERE id = ? )");
    });

    it("where not exists", () => {
        const result = sqb().select("*").from("users").whereNotExists(sqb().where("id", 1).from("comments")).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE NOT EXISTS ( SELECT * FROM `comments` WHERE id = ? )");
    });

    it("where in", () => {
        const result = sqb().select("*").from("users").whereIn('id', [1, 2, 3]).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id IN (?,?,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, 2, 3]);

    })

    it("where not in", () => {
        const result = sqb().select("*").from("users").whereNotIn('id', [1, 2, 3]).toDB();
        expect(result.expression).to.eq("SELECT * FROM `users` WHERE id NOT IN (?,?,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, 2, 3]);
    })

    it("where between", () => {
        const result = sqb().select("*").from("users").whereBetween('id', [1, 2]).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id BETWEEN ? AND ?");
        expect(result.bindings).to.be.an("array").to.include.members([1, 2]);
    })

    it("where not between", () => {
        const result = sqb().select("*").from("users").whereNotBetween('id', [1, 2]).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id NOT BETWEEN ? AND ?");
        expect(result.bindings).to.be.an("array").to.include.members([1, 2]);
    })

    it("where simple and", () => {
        const result = sqb().select("*").from("users").where("id", 1).where("email", "spine@spine.pl").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id = ? AND email = ?");
        expect(result.bindings).to.be.an("array").to.include("spine@spine.pl");
    })

    it("where simple or", () => {
        const result = sqb().select("*").from("users").where("id", 1).orWhere("email", "spine@spine.pl").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id = ? OR email = ?");
        expect(result.bindings).to.be.an("array").to.include.members([1, "spine@spine.pl"]);
    })

    it("where nested expressions", () => {
        const result = sqb().select("*").from("users").where("id", 1).orWhere("email", "spine@spine.pl").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id = ? OR email = ?");
    })

    it("where true && where false", () => {
        let result = sqb().select("*").from("users").where(true).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE TRUE");

        result = sqb().select("*").from("users").where(false).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE FALSE");
    });

    it("where with nested expressions", () => {

        const result = sqb().select("*").from("users").where(function () {
            this.where("a", 1).where("b", 2);
        }).orWhere(function () {
            this.where("c", 1).where("d", 2);
        }).orWhere("f", 3).toDB();

        expect(result.expression).to.equal("SELECT * FROM `users` WHERE ( a = ? AND b = ? ) OR ( c = ? AND d = ? ) OR f = ?");
    });

    it("where RAW expressions", () => {
        const result = sqb().select("*").from("users").where(RawQuery.create("foo = bar AND zar.id = tar.id")).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE foo = bar AND zar.id = tar.id");
    });

    it("where explicit operator", () => {

        const result = sqb().select("*").from("users").where("id", ">=", 1).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id >= ?");

        expect(() => {
            sqb().select("*").from("users").where("id", ">==", 1).toDB();
        }).to.throw();
    });

    it("where object as argument", () => {
        const result = sqb().select("*").from("users").where({
            id: 1,
            active: true
        }).toDB();

        expect(result.expression).to.equal("SELECT * FROM `users` WHERE id = ? AND active = ?");
        expect(result.bindings).to.be.an("array").to.include(1).and.include(true);

    });

    it("where throws if value is undefined", () => {
        expect(() => {
            sqb().select("*").from("users").where("id", undefined).toDB();
        }).to.throw;
    });
});


describe("Delete query builder", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("Simple delete", () => {
        const result = dqb().from("users").schema("spine").where("active", false).toDB();
        expect(result.expression).to.equal("DELETE FROM `spine`.`users` WHERE active = ?");
    });

    it("Simple truncate", () => {
        const result = dqb().from("users").schema("spine").truncate().toDB();
        expect(result.expression).to.equal("TRUNCATE TABLE `spine`.`users`");
    });
});

describe("Relations query builder", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        const tableInfoStub = sinon.stub(FakeSqliteDriver.prototype, "tableInfo");
        tableInfoStub.withArgs("RelationTable", undefined).returns(new Promise(res => {
            res([{
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },
            {
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "relation_id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },
            {
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "relation2_id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }]);
        })).withArgs("RelationTable2", undefined).returns(new Promise(res => {
            res([{
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }, {
                Type: "VARCHAR",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "VARCHAR",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "RelationProperty",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }]);
        })).withArgs("RelationTable3", undefined).returns(new Promise(res => {
            res([{
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }, {
                Type: "VARCHAR",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "VARCHAR",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "RelationProperty3",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }])
        })).withArgs("JoinTable", undefined).returns(new Promise(res => {
            res([{
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },
            {
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: false,
                AutoIncrement: false,
                Name: "owner_id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },
            {
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: false,
                AutoIncrement: false,
                Name: "target_id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            }
            ])
        })).withArgs("RelationTable4", undefined).returns(new Promise(res => {
            res([{
                Type: "INT",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "INT",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Id",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },
            {
                Type: "VARCHAR",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "VARCHAR",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: false,
                AutoIncrement: false,
                Name: "Model4Property",
                Converter: null,
                Schema: "sqlite",
                Unique: false,
                Uuid: false,
                Ignore: false
            },

            ])
        }));

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
        sinon.restore();
    });

    it("belongsTo simple", () => {
        const result = RelationModel.where("Id", 1).populate("Relation").toDB();

        expect(result.expression).to.equal("SELECT `$RelationModel$`.*,`$Relation$`.`Id` as `$Relation$.Id`,`$Relation$`.`RelationProperty` as `$Relation$.RelationProperty` FROM `RelationTable` as `$RelationModel$` LEFT JOIN `RelationTable2` as `$Relation$` ON `$Relation$`.Id = `$RelationModel$`.relation_id WHERE `$RelationModel$`.Id = ?");
    });

    it("belongsTo nested", () => {
        const result = RelationModel.where("Id", 1).populate("Relation", function () {
            this.populate("Relation3");
        }).toDB();

        expect(result.expression).to.equal("SELECT `$RelationModel$`.*,`$RelationModel2$`.`Id` as `$Relation$.Id`,`$RelationModel2$`.`RelationProperty` as `$Relation$.RelationProperty`,`$Relation$.$Relation3$`.`Id` as `$Relation$.$Relation3$.Id`,`$Relation$.$Relation3$`.`RelationProperty3` as `$Relation$.$Relation3$.RelationProperty3` FROM `RelationTable` as `$RelationModel$` LEFT JOIN `RelationTable2` as `$Relation$` ON `$Relation$`.Id = `$RelationModel$`.relation_id LEFT JOIN `RelationTable3` as `$Relation$.$Relation3$` ON `$Relation$.$Relation3$`.Id = `$RelationModel2$`.relation3_id WHERE `$RelationModel$`.Id = ?");
    });

    it("belongsTo with custom keys", () => {
        const result = RelationModel.where("Id", 1).populate("Relation2").toDB();
        expect(result.expression).to.equal("SELECT `$RelationModel$`.*,`$Relation2$`.`Id` as `$Relation2$.Id`,`$Relation2$`.`RelationProperty` as `$Relation2$.RelationProperty` FROM `RelationTable` as `$RelationModel$` LEFT JOIN `RelationTable2` as `$Relation2$` ON `$Relation2$`.fK_Id = `$RelationModel$`.pK_Id WHERE $RelationModel$.Id = ?");
    });

    it("hasManyToMany", async () => {

        const relStub = sinon.stub(FakeSqliteDriver.prototype, "execute").onFirstCall().returns(new Promise((res) => {
            res([{
                Id: 1
            },
            {
                Id: 2
            }])
        })).onSecondCall().returns(new Promise((res) => {
            res([]);
        }));


        const result = await RelationModel3.all().populate("Models");

        expect(relStub.calledTwice).to.be.true;
        expect(result).to.be.not.null;
        expect(relStub.firstCall.args[0]).to.equal("SELECT * FROM `RelationTable3`");
        expect(relStub.secondCall.args[0]).to.equal("SELECT `$JoinTable$`.`Id`,`$JoinTable$`.`owner_id`,`$JoinTable$`.`target_id`,`$Models$`.`Id` as `$Models$.Id`,`$Models$`.`Model4Property` as `$Models$.Model4Property` FROM `JoinTable` as `$JoinTable$` LEFT JOIN `RelationTable4` as `$Models$` ON `$Models$`.Id = `$JoinTable$`.target_id WHERE owner_id IN (?,?)");

    });
});

describe("Select query builder", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("group by simple", () =>{
        const result = sqb().groupBy("Category").from("roles").columns(["id", "parent_id", "slug"]).toDB();
        expect(result.expression).to.equal("SELECT `id`,`parent`,`slug` FROM `roles` GROUP BY `Category`");

    })

    it("group by raw", () =>{
        const result = sqb().groupBy(new RawQuery("DATE(`CreatedAt`)")).from("roles").columns(["id", "parent_id", "slug"]).toDB();
        expect(result.expression).to.equal("SELECT `id`,`parent`,`slug` FROM `roles` GROUP BY DATE(`CreatedAt`)");

    })

    it("withRecursion simple", () => {
        const result = sqb().withRecursive("parent_id", "id").from("roles").columns(["id", "parent_id", "slug"]).toDB();
        expect(result.expression).to.equal("WITH RECURSIVE recursive_cte AS ( SELECT `id`,`parent_id`,`slug` FROM `roles` UNION ALL SELECT `$recursive$`.`id`,`$recursive$`.`parent_id`,`$recursive$`.`slug` FROM `roles` as `$recursive$` INNER JOIN `recursive_cte` as `$recursive_cte$` ON `$recursive$`.parent_id = `$recursive$`.id ) SELECT * FROM recursive_cte");
    })

    it("withRecursion with where", () => {
        const result = sqb().withRecursive("parent_id", "id").from("roles").columns(["id", "parent_id", "slug"]).where("id", 2).toDB();
        expect(result.expression).to.equal("WITH RECURSIVE recursive_cte AS ( SELECT `id`,`parent_id`,`slug` FROM `roles` WHERE id = ? UNION ALL SELECT `$recursive$`.`id`,`$recursive$`.`parent_id`,`$recursive$`.`slug` FROM `roles` as `$recursive$` INNER JOIN `recursive_cte` as `$recursive_cte$` ON `$recursive$`.parent_id = `$recursive$`.id ) SELECT * FROM recursive_cte");
        expect(result.bindings).to.be.an("array").to.include(2);
    })

    it("basic select", () => {
        const result = sqb().select("*").from("users").toDB();

        expect(result.expression).to.equal("SELECT * FROM `users`");
        expect(result.bindings).to.be.an("array").that.is.empty;
    });

    it("basic select with schema", () => {
        const result = sqb().select("*").from("users").schema("spine").toDB();
        expect(result.expression).to.equal("SELECT * FROM `spine`.`users`");
    });

    it("multiple selects", () => {
        const result = sqb().select("foo").select("bar").select("tar").from("users").toDB();
        expect(result.expression).to.equal("SELECT `foo`,`bar`,`tar` FROM `users`");
    })

    it("multiple selects with aliases", () => {
        const result = sqb().select("foo", "f").select("bar", "b").select("tar", "t").from("users").toDB();
        expect(result.expression).to.equal("SELECT `foo` as `f`,`bar` as `b`,`tar` as `t` FROM `users`");
    })

    it("multiple selects by columns", () => {
        const result = sqb().columns([
            'foo',
            'bar',
            'tar'
        ]).from("users").toDB();
        expect(result.expression).to.equal("SELECT `foo`,`bar`,`tar` FROM `users`");
    })

    it("select with limit", () => {
        const result = sqb().select("*").from("users").take(1).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LIMIT ?");
    })

    it("select first", () => {
        const result = sqb().select("*").from("users");

        result.first();

        expect(result.toDB().expression).to.equal("SELECT * FROM `users` LIMIT ?");
        expect(result.toDB().bindings).to.be.an("array").to.include(1);
    })

    it("select with limit & skip", () => {
        const result = sqb().select("*").from("users").take(1).skip(10).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LIMIT ? OFFSET ?");
    })

    it("select with skip", () => {
        const result = sqb().select("*").from("users").skip(10).toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` LIMIT 18446744073709551615 OFFSET ?");
    })

    it("select with take & skip invalid args", () => {
        expect(() => {
            sqb().select("*").from("users").take(0)
        }).to.throw();

        expect(() => {
            sqb().select("*").from("users").skip(-1)
        }).to.throw();
    })

    it("where empty function", () => {
        // tslint:disable-next-line: only-arrow-functions
        // tslint:disable-next-line: no-empty
        const result = sqb().select("*").from("users").where(function (_builder: IWhereBuilder) {

        }).toDB();

        expect(result.expression).to.eq("SELECT * FROM `users`");
    })

    it("select with order by", () => {
        const result = sqb().select("*").from("users").orderByDescending("name").toDB();
        expect(result.expression).to.equal("SELECT * FROM `users` ORDER BY ? ?");
        expect(result.bindings).to.be.an("array").to.include("DESC").and.to.include("name");
    })

    it("select distinct", () => {
        const result = sqb().select("bar").from("users").distinct().toDB();
        expect(result.expression).to.equal("SELECT DISTINCT `bar` FROM `users`");
    })

    it("select distinct column check", () => {
        expect(() => {
            sqb().from("users").distinct();
        }).to.throw();

        expect(() => {
            sqb().select("*").from("users").distinct();
        }).to.throw();
    })

    it("select min", () => {
        let result = sqb().min("age").from("users").toDB().expression;
        expect(result).to.equal("SELECT MIN(`age`) FROM `users`");

        result = sqb().min("age", "a").from("users").toDB().expression;
        expect(result).to.equal("SELECT MIN(`age`) as `a` FROM `users`");
    })

    it("select max", () => {
        let result = sqb().max("age").from("users").toDB().expression;
        expect(result).to.equal("SELECT MAX(`age`) FROM `users`");

        result = sqb().max("age", "a").from("users").toDB().expression;
        expect(result).to.equal("SELECT MAX(`age`) as `a` FROM `users`");
    })

    it("select count", () => {
        let result = sqb().count("age").from("users").toDB().expression;
        expect(result).to.equal("SELECT COUNT(`age`) FROM `users`");

        result = sqb().count("age", "a").from("users").toDB().expression;
        expect(result).to.equal("SELECT COUNT(`age`) as `a` FROM `users`");
    })

    it("select sum", () => {
        let result = sqb().sum("age").from("users").toDB().expression;
        expect(result).to.equal("SELECT SUM(`age`) FROM `users`");

        result = sqb().sum("age", "a").from("users").toDB().expression;
        expect(result).to.equal("SELECT SUM(`age`) as `a` FROM `users`");
    })

    it("select avg", () => {
        let result = sqb().avg("age").from("users").toDB().expression;
        expect(result).to.equal("SELECT AVG(`age`) FROM `users`");

        result = sqb().avg("age", "a").from("users").toDB().expression;
        expect(result).to.equal("SELECT AVG(`age`) as `a` FROM `users`");
    })

    it("select raw", () => {
        const result = sqb().select(RawQuery.create("LENGTH(`name`) as `len`")).select("bar", "b").from("users").toDB().expression;
        expect(result).to.equal("SELECT LENGTH(`name`) as `len`,`bar` as `b` FROM `users`");
    })

    it("select function with * column", () => {
        const result = sqb().count("*").from("users").toDB().expression;
        expect(result).to.equal("SELECT COUNT(*) FROM `users`");
    })
});


describe("insert query builder", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("simple insert", () => {
        const result = iqb().into("users").values({
            id: 1,
            active: true,
            email: "spine@spine.pl"
        }).toDB();

        expect(result.expression).to.equal("INSERT INTO `users` (`id`,`active`,`email`) VALUES (?,?,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, true, "spine@spine.pl"]);
    })

    it("insert with default values", () => {
        const result = iqb().into("users").values({
            id: 1,
            active: undefined,
            email: "spine@spine.pl"
        }).toDB();

        expect(result.expression).to.equal("INSERT INTO `users` (`id`,`active`,`email`) VALUES (?,DEFAULT,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, "spine@spine.pl"]);
    })

    it("insert multiple values", () => {
        const vals = [
            {
                id: 1,
                active: undefined,
                email: "spine@spine.pl"
            },
            {
                id: 2,
                active: true,
                email: "spine2@spine.pl"
            }
        ]
        const result = iqb().into("users").values(vals).toDB();

        expect(result.expression).to.equal("INSERT INTO `users` (`id`,`active`,`email`) VALUES (?,DEFAULT,?),(?,?,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, "spine@spine.pl", 2, true, "spine2@spine.pl"]);
    })

    it("insert with ignore", () => {

        const result = iqb().into("users").values({
            id: 1, active: true, email: "spine@spine.pl"
        }).ignore().toDB();


        expect(result.expression).to.equal("INSERT IGNORE INTO `users` (`id`,`active`,`email`) VALUES (?,?,?)");
        expect(result.bindings).to.be.an("array").to.include.members([1, true, "spine@spine.pl", "spine@spine.pl", true]);
    });

    it("insert with on duplicate", () => {

        const result = iqb().into("users").values({
            id: 1, active: true, email: "spine@spine.pl"
        }).onDuplicate().update(["email", "active"]).toDB();


        expect(result.expression).to.equal("INSERT INTO `users` (`id`,`active`,`email`) VALUES (?,?,?) ON DUPLICATE KEY UPDATE `email` = `?`,`active` = `?`");
        expect(result.bindings).to.be.an("array").to.include.members([1, true, "spine@spine.pl", "spine@spine.pl", true]);
    });
});

describe("schema building", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
    });

    it("table with one foreigk key", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").notNull().primaryKey().autoIncrement();
            table.foreignKey("parent_id").references("group", "id").onDelete(ReferentialAction.Cascade).onUpdate(ReferentialAction.Cascade);
        }).toDB();

        expect(result.expression).to.eq("CREATE TABLE `users` (`foo` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`foo`),FOREIGN KEY (parent_id) REFERENCES group(id) ON DELETE CASCADE ON UPDATE CASCADE)");
    })

    it("table with default referential action", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").notNull().primaryKey().autoIncrement();
            table.foreignKey("parent_id").references("group", "id");
        }).toDB();

        expect(result.expression).to.eq("CREATE TABLE `users` (`foo` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`foo`),FOREIGN KEY (parent_id) REFERENCES group(id) ON DELETE NO ACTION ON UPDATE NO ACTION)");
    })

    it("column with one primary keys", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").notNull().primaryKey().autoIncrement()
        }).toDB();

        expect(result.expression).to.equal("CREATE TABLE `users` (`foo` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`foo`))");
    })


    it("column with multiple primary keys", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").notNull().primaryKey().autoIncrement();
            table.int("bar").notNull().primaryKey().autoIncrement();

        }).toDB();

        expect(result.expression).to.equal("CREATE TABLE `users` (`foo` INT NOT NULL AUTO_INCREMENT,`bar` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`foo`,`bar`))");
    })

    it("column with charset", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.string("foo").charset("utf8")
        }).toDB();

        expect(result.expression).to.contain("`foo` VARCHAR(255) CHARACTER SET 'utf8'");
    })

    it("column with collation", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.string("foo").collation("utf8_bin")
        }).toDB();

        expect(result.expression).to.contain("`foo` VARCHAR(255) COLLATE 'utf8_bin'");
    })

    it("column with default", () => {
        let result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").unsigned().default(1);
        }).toDB();

        expect(result.expression).to.contain("`foo` INT UNSIGNED DEFAULT 1");

        result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.string("foo").default("abc");
        }).toDB();

        expect(result.expression).to.contain("`foo` VARCHAR(255) DEFAULT 'abc'");

        result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.timestamp("foo").default(RawQuery.create("CURRENT_TIMESTAMP"));
        }).toDB();

        expect(result.expression).to.contain("`foo` TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    })

    it("create index", () => {
        const result = inqb().table("metadata").unique().name("metadata_owners_idx").columns(["OwnerId", "Key"]).toDB();

        expect(result.expression).to.contain("CREATE UNIQUE INDEX `metadata_owners_idx` ON metadata (`OwnerId`,`Key`)");
    })


    it("column with auto increment", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").unsigned().autoIncrement();
        }).toDB();

        expect(result.expression).to.contain("`foo` INT UNSIGNED AUTO_INCREMENT");
    })

    it("column with unsigned", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.int("foo").unsigned();
        }).toDB();

        expect(result.expression).to.contain("`foo` INT UNSIGNED");
    })

    it("column with comment", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.text("foo").comment("spine comment");
        }).toDB();

        expect(result.expression).to.contain("COMMENT 'spine comment'");
    })

    it("column with not null", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.text("foo").notNull();
        }).toDB();

        expect(result.expression).to.contain("`foo` TEXT NOT NULL");
    })



    it("column types", () => {
        const result = schqb().createTable("users", (table: TableQueryBuilder) => {
            table.smallint("foo");
            table.tinyint("foo");
            table.mediumint("foo");
            table.int("foo");
            table.bigint("foo");
            table.tinytext("foo");
            table.mediumtext("foo");
            table.longtext("foo");
            table.text("foo");
            table.string("foo");
            table.float("foo");
            table.decimal("foo");
            table.boolean("foo");
            table.bit("foo");
            table.double("foo");
            table.date("foo");
            table.time("foo");
            table.dateTime("foo");
            table.timestamp("foo");
            table.json("foo");
            table.set("foo", ["bar", "baz"]);
        }).toDB();

        expect(result.expression).to.contain("`foo` SMALLINT");
        expect(result.expression).to.contain("`foo` TINYINT");
        expect(result.expression).to.contain("`foo` INT");
        expect(result.expression).to.contain("`foo` BIGINT");
        expect(result.expression).to.contain("`foo` TINYTEXT");
        expect(result.expression).to.contain("`foo` MEDIUMTEXT");
        expect(result.expression).to.contain("`foo` LONGTEXT");
        expect(result.expression).to.contain("`foo` LONGTEXT");
        expect(result.expression).to.contain("`foo` TEXT");
        expect(result.expression).to.contain("`foo` VARCHAR(255)"); // string
        expect(result.expression).to.contain("`foo` FLOAT(8,2)");
        expect(result.expression).to.contain("`foo` DECIMAL(8,2)");
        expect(result.expression).to.contain("`foo` TINYINT(1)"); // boolean
        expect(result.expression).to.contain("`foo` BIT");
        expect(result.expression).to.contain("`foo` DOUBLE(8,2)");
        expect(result.expression).to.contain("`foo` DATE");
        expect(result.expression).to.contain("`foo` TIME");
        expect(result.expression).to.contain("`foo` DATETIME");
        expect(result.expression).to.contain("`foo` TIMESTAMP");
        expect(result.expression).to.contain("`foo` JSON");
        expect(result.expression).to.contain("`foo` SET('bar','baz')");
    })
});