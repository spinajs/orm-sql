import { IValueConverter } from '@spinajs/orm';

export class SqlSetConverter implements IValueConverter {
  public toDB(value: any) {
    if (value) {
      return value.join(',');
    }
    return '';
  }

  public fromDB(value: any) {
    if (value) {
      return value.split(',');
    }
    return [];
  }
}
