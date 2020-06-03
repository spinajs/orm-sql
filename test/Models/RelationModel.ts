import { Connection, ModelBase, Model, Primary, BelongsTo } from "@spinajs/orm";
import { RelationModel2 } from "./RelationModel2";

@Connection("sqlite")
@Model("RelationTable")
// @ts-ignore
export class RelationModel extends ModelBase<RelationModel>
{
    @Primary()
    public Id: number;
    
    @BelongsTo()
    public Relation : RelationModel2;

    @BelongsTo("pK_Id", "fK_Id")
    public Relation2 : RelationModel2;
}
