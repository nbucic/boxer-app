import { toolService } from '@/services/tool';
import { ToolCard } from '@/components/list/ToolCard';
import { Tool } from '@/types/tools';
import { WrenchIcon } from 'lucide-react-native';
import { EntityListScreen } from '@/components/screens/EntityListScreen';

export default function Index() {
  return (
    <EntityListScreen<Tool>
      queryKey={['tools']}
      fetchDataFn={() =>
        toolService.getList({}, { include: 'box:boxes (id, name)' })
      }
      deleteItemFn={(id: string) => toolService.delete(id)}
      prefetchItemFn={(id: string) => toolService.getEditData(id)}
      itemName="Tool"
      screenTitle="Items"
      loadingDataMessage="Finding all your tools across the boxes..."
      layoutStorageKey="@items_layout"
      editRoute={(id) => `/tool/${id}/edit`}
      createRoute="/tool/create"
      emptyStateIcon={WrenchIcon}
      emptyStateTitle="Tools"
      emptyStateSubtitle="The tool makes the workman. Let's add a few of them, shall we?"
      emptyStateAction="+ Add new tool"
      renderCard={({ item, layout, swipeProperties }) => (
        <ToolCard
          item={item}
          listType="swipeable"
          layout={layout}
          swipeProperties={swipeProperties}
        />
      )}
    />
  );
}
