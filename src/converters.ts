import { IValueConverter } from "@spinajs/orm";

export class SetConverter implements IValueConverter
{
  public toDB(value: any) {
    return value.join(',');
  }  

  public fromDB(value: any) {
     return value.split(',');
  }
}