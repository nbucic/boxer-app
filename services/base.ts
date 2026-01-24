import { supabase } from '@/lib/supabase';
import { handleErrors } from '@/lib/helpers/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import {
  getSignedUrlForImage,
  handleImageUploadToTheBucket,
} from '@/lib/helpers/supabase/storage';

export type Bucket = 'boxes' | 'tools' | 'avatar';
export type ImageURL = 'avatar_url' | 'image_url';

export type FilterProp = {
  search?: string;
  limit?: number;
  [key: string]: any;
};

export type OptionsProp = {
  include?: string;
};

export abstract class BaseService<T> {
  protected abstract TABLE_NAME: string;
  protected abstract BUCKET_NAME: Bucket | null | undefined;
  abstract get(id: string, includeExtra: boolean): Promise<T>;
  abstract getList(filter: FilterProp, options: OptionsProp): Promise<T[]>;
  abstract create(formData: any): Promise<void>;
  abstract update(id: string, formData: any): Promise<void>;
  abstract delete(id: string): Promise<void>;

  protected async getItem<T>(
    id: string,
    options: OptionsProp = {},
    image_url: ImageURL = 'image_url'
  ): Promise<T> {
    let selectColumns = ['*'];

    if (options.include) {
      selectColumns.push(options.include);
    }

    const { data, error }: { data: any | null; error: PostgrestError | null } =
      await supabase
        .from(this.TABLE_NAME)
        .select(selectColumns.join(', '))
        .eq('id', id)
        .single();

    handleErrors(error, `Get ${this.TABLE_NAME} error:`);

    if (!this.BUCKET_NAME) {
      return data as T;
    }

    const response = {
      ...data,
      [image_url]: await this.manipulateImageUrl(data[image_url]),
    };

    return response as T;
  }

  protected async getItems<T>(
    filter: FilterProp = {},
    options: OptionsProp = {},
    image_url: ImageURL = 'image_url'
  ): Promise<T[]> {
    let selectColumns = ['*'];
    if (options.include) {
      selectColumns.push(options.include);
    }

    let query = supabase
      .from(this.TABLE_NAME)
      .select(selectColumns.join(', '))
      .order('updated_at', { ascending: false });

    if (filter.search) {
      query = query.or(
        `name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`
      );
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    Object.keys(filter).forEach((key) => {
      if (key !== 'search' && key !== 'limit') {
        query = query.eq(`${key}_id`, filter[key]);
      }
    });

    const {
      data,
      error,
    }: { data: any; error: null } | { data: null; error: PostgrestError } =
      await query;

    handleErrors(error, `Get ${this.TABLE_NAME} list error:`);

    if (!this.BUCKET_NAME) {
      return data as T[];
    }

    return Promise.all(
      data.map(async (item: Record<string, any>) => {
        return {
          ...item,
          [image_url]: await this.manipulateImageUrl(item[image_url]),
        };
      })
    );
  }

  protected async createItem<T extends Record<string, any>>(
    formData: T,
    manipulateImageUrl: 'image_url' | 'avatar_url' = 'image_url'
  ): Promise<void> {
    const { new_asset, ...data } = formData;

    const { data: response, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(data)
      .select('id')
      .single();

    handleErrors(error, `Create ${this.TABLE_NAME} error:`);

    if (response?.id && this.BUCKET_NAME) {
      const image_url = await handleImageUploadToTheBucket({
        imageName: response.id,
        asset: new_asset!,
        bucket: this.BUCKET_NAME,
      });

      const { error: uploadImageError } = await supabase
        .from(this.TABLE_NAME)
        .update({ [manipulateImageUrl]: image_url })
        .eq('id', response.id);

      handleErrors(
        uploadImageError,
        `Image update for ${this.TABLE_NAME} error:`
      );
    }
  }

  protected async updateItem<T extends Record<string, any>>(
    id: string,
    formData: T,
    manipulateImageUrl: 'image_url' | 'avatar_url' = 'image_url'
  ): Promise<void> {
    const { new_asset, ...rest } = formData;
    const data = rest as Record<string, any>;

    if (new_asset && this.BUCKET_NAME) {
      data[manipulateImageUrl] = await handleImageUploadToTheBucket({
        imageName: id,
        asset: new_asset,
        bucket: this.BUCKET_NAME,
      });
    }

    const { error } = await supabase
      .from(this.TABLE_NAME)
      .update(data)
      .eq('id', id);

    handleErrors(error, 'Update ${this.TABLE_NAME} error:');
  }

  protected async deleteItem(id: string) {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    debugger;
    handleErrors(error, `Delete ${this.TABLE_NAME} error:`);
  }

  private async manipulateImageUrl(image_url: string): Promise<string | null> {
    if (!image_url || !this.BUCKET_NAME) {
      return null;
    }

    return await getSignedUrlForImage({
      url: image_url,
      bucket: this.BUCKET_NAME,
    });
  }
}
