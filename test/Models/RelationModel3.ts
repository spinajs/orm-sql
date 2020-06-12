import { Connection, ModelBase, Model, Primary, HasManyToMany } from "@spinajs/orm";
import { RelationModel4 } from "./RelationModel4";
import { JoinModel } from "./JoinModel";

@Connection("sqlite")
@Model("RelationTable3")
// @ts-ignore
export class RelationModel3 extends ModelBase<RelationModel2>
{
    @Primary()
    public Id: number;
    
    public RelationProperty3: string;
    
    @HasManyToMany(JoinModel, RelationModel4,"Id","Id","target_id","owner_id")
    public Models: RelationModel4[];
}
