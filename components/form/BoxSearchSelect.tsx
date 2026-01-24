import { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { boxService } from '@/services/box';
import { SearchSelectBase } from '@/components/form/SearchSelectBase';

interface Props {
  value?: string | null;
  onSelect: (boxId: string | null) => void;
  disabled?: boolean;
}

export interface BoxSearchSelectRef {
  focus: () => void;
  close: () => void;
}

export const BoxSearchSelect = forwardRef<BoxSearchSelectRef, Props>(
  ({ value, onSelect, disabled = false }, ref) => {
    const { data: selectedBox } = useQuery({
      queryKey: ['box', value],
      queryFn: () => boxService.get(value!),
      enabled: !!value,
    });

    return (
      <SearchSelectBase
        value={selectedBox?.name}
        onSelect={onSelect}
        searchQuery={{
          queryKey: ['boxes'],
          queryFn: boxService.getList,
        }}
        disabled={disabled}
        title={'Search for a box...'}
        placeholder={'Select a box'}
        ref={ref}
      />
    );
  }
);

BoxSearchSelect.displayName = 'Box Search Select';
