import { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location';
import { SearchSelectBase } from '@/components/form/SearchSelectBase';

interface Props {
  value?: string | null;
  onSelect: (locationId: string | null) => void;
  disabled?: boolean;
}

export interface LocationSearchSelectRef {
  focus: () => void;
  close: () => void;
}

export const LocationSearchSelect = forwardRef<LocationSearchSelectRef, Props>(
  ({ value, onSelect, disabled = false }, ref) => {
    const { data: selectedLocation } = useQuery({
      queryKey: ['location', value],
      queryFn: () => locationService.get(value!),
      enabled: !!value,
    });

    return (
      <SearchSelectBase
        value={selectedLocation?.name}
        onSelect={onSelect}
        searchQuery={{
          queryKey: ['locations'],
          queryFn: locationService.getList,
        }}
        disabled={disabled}
        title={'Search for a location...'}
        placeholder={'Filter locations'}
        ref={ref}
      />
    );
  }
);

LocationSearchSelect.displayName = 'Location Search Select';
