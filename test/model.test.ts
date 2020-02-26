import { DI } from "@spinajs/di";
import { ConnectionConf, FakeSqliteDriver } from "./fixture";
import { Configuration } from "@spinajs/configuration";
import { SpinaJsDefaultLog, LogModule } from "@spinajs/log";
import { Orm } from "@spinajs/orm";
import { Model1 } from "./Models/Model1";
import { expect } from 'chai';
import 'mocha';

describe("model generated queries", () => {

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

    it("static model update", async () =>{

        const query = Model1.update({ Bar: 1}).where({
            Id: 1
        });

        const query2 =  Model1.update({ Bar: 1}).where({
            Id: null
        });

        expect(query.toDB().expression).to.eq("UPDATE `TestTable1` SET `Bar` = ? WHERE `Id` = ?")
        expect(query2.toDB().expression).to.eq("UPDATE `TestTable1` SET `Bar` = ? WHERE `Id` IS NULL")

    });

});