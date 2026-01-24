import { Tool, ToolFormData } from '@/types/tools';
import { BaseService, Bucket, FilterProp, OptionsProp } from '@/services/base';

class ToolService extends BaseService<Tool> {
  protected TABLE_NAME = 'tools';
  protected BUCKET_NAME: Bucket = 'tools';

  async get(id: string, includeExtra: boolean = true): Promise<Tool> {
    return await super.getItem<Tool>(
      id,
      includeExtra ? { include: 'box:boxes(id, name)' } : undefined
    );
  }

  async getEditData(id: string): Promise<Tool> {
    return this.get(id, false);
  }

  async getList(
    filter: FilterProp = {},
    options: OptionsProp = {}
  ): Promise<Tool[]> {
    return await super.getItems(filter, options);
  }

  async create(formData: ToolFormData): Promise<void> {
    await super.createItem(formData);
  }

  async update(id: string, formData: ToolFormData): Promise<void> {
    await super.updateItem(id, formData);
  }

  async delete(id: string): Promise<void> {
    await super.deleteItem(id);
  }
}

export const toolService = new ToolService();
