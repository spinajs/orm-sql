import { DI } from "@spinajs/di";
import { ConnectionConf, FakeSqliteDriver } from "./fixture";
import { Configuration } from "@spinajs/configuration";
import { SpinaJsDefaultLog, LogModule } from "@spinajs/log";
import { Orm } from "@spinajs/orm";
import { Model1 } from "./Models/Model1";
import * as chai from 'chai';
import 'mocha';
import sinon from "sinon";
import { Model2 } from "./Models/Model2";
import chaiAsPromised from 'chai-as-promised';

const expect = chai.expect;
chai.use(chaiAsPromised);


describe("model generated queries", () => {

    beforeEach(async () => {
        DI.register(ConnectionConf).as(Configuration);
        DI.register(SpinaJsDefaultLog).as(LogModule);
        DI.register(FakeSqliteDriver).as("sqlite");

        await DI.resolve(LogModule);
        await DI.resolve(Orm);
    });

    afterEach(async () => {
        DI.clear();
        sinon.restore();
    });

    it("static model update", async () => {

        const query = Model1.update({ Bar: 1 }).where({
            Id: 1
        });

        const query2 = Model1.update({ Bar: 1 }).where({
            Id: null
        });

        expect(query.toDB().expression).to.eq("UPDATE `TestTable1` SET `Bar` = ? WHERE Id = ?")
        expect(query2.toDB().expression).to.eq("UPDATE `TestTable1` SET `Bar` = ? WHERE Id IS NULL")

    });

    it("insert should throw when fields are null", async () => {
        const tableInfoStub = sinon.stub(FakeSqliteDriver.prototype, "tableInfo");
        tableInfoStub.withArgs("TestTable2", undefined).returns(new Promise(res => {
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
                Unique: false
            },
            {
                Type: "VARCHAR",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "VARCHAR",
                Unsigned: false,
                Nullable: false,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Bar",
                Converter: null,
                Schema: "sqlite",
                Unique: false
            },
            {
                Type: "VARCHAR",
                MaxLength: 0,
                Comment: "",
                DefaultValue: null,
                NativeType: "VARCHAR",
                Unsigned: false,
                Nullable: true,
                PrimaryKey: true,
                AutoIncrement: true,
                Name: "Far",
                Converter: null,
                Schema: "sqlite",
                Unique: false
            }]);
        }));

        const model = new Model2({
            Far: "hello"
        });
        model.Bar = "dada";
    
        expect(model.save()).to.be.rejected;

        model.Bar = "dada";
        expect(model.save()).to.be.fulfilled;
    });

 
});
