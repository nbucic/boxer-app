import { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLocation, getLocations } from '@/services/location';
import { SearchSelectBase } from '@/components/form/SearchSelectBase';

interface Props {
  value?: string | null; // location_id
  onSelect: (locationId: string | null) => void;
  disabled: boolean;
}

export interface LocationSearchSelectRef {
  focus: () => void;
  close: () => void;
}

export const LocationSearchSelect = forwardRef<LocationSearchSelectRef, Props>(
  ({ value, onSelect, disabled = false }, ref) => {
    const { data: selectedLocation } = useQuery({
      queryKey: ['location', value],
      queryFn: () => getLocation(value!),
      enabled: !!value,
    });

    return (
      <SearchSelectBase
        value={selectedLocation?.name}
        onSelect={onSelect}
        searchQuery={{
          queryKey: 'locations',
          queryFn: getLocations,
        }}
        disabled={disabled}
        title={'Search for a location...'}
        placeholder={'Select a location'}
        ref={ref}
      />
    );
  }
);
