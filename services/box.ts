import { Box, BoxFormData } from '@/types/box';
import { BaseService, Bucket, FilterProp, OptionsProp } from '@/services/base';

class BoxService extends BaseService<Box> {
  protected TABLE_NAME = 'boxes';
  protected BUCKET_NAME: Bucket = 'boxes';

  async get(id: string, includeExtra: boolean = true): Promise<Box> {
    return await super.getItem<Box>(
      id,
      includeExtra ? { include: 'location:locations (id, name)' } : undefined
    );
  }

  async getEditData(id: string): Promise<Box> {
    return this.get(id, false);
  }

  async getList(
    filter: FilterProp = {},
    options: OptionsProp = {}
  ): Promise<Box[]> {
    return await super.getItems<Box>(filter, options);
  }

  async create(formData: BoxFormData): Promise<void> {
    await super.createItem<BoxFormData>(formData);
  }

  async update(id: string, formData: BoxFormData): Promise<void> {
    await super.updateItem<BoxFormData>(id, formData);
  }

  async delete(id: string) {
    await super.deleteItem(id);
  }
}

export const boxService = new BoxService();
