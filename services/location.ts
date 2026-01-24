import { supabase } from '@/lib/supabase';
import { Location, LocationFormData } from '@/types/location';
import { handleErrors } from '@/lib/helpers/supabase';
import { BaseService, FilterProp, OptionsProp } from '@/services/base';

class LocationService extends BaseService<Location> {
  protected TABLE_NAME: string = 'locations';
  protected BUCKET_NAME = null;

  async get(id: string): Promise<Location> {
    return super.getItem(id);
  }

  async getList(
    filter: FilterProp = {},
    _options: OptionsProp = {}
  ): Promise<Location[]> {
    return super.getItems(filter, {});
  }

  async create(formData: LocationFormData): Promise<void> {
    await super.createItem(formData);
  }

  async update(id: string, formData: LocationFormData): Promise<void> {
    await super.updateItem(id, formData);
  }

  async delete(id: string): Promise<void> {
    await super.deleteItem(id);
  }

  async isEmpty(id: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('boxes')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', id);

    handleErrors(error, 'Error counting boxes by location:', id);

    return count ? count === 0 : true;
  }
}

export const locationService = new LocationService();
