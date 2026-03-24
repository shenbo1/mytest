import { Button } from "~/components/ui/button";
import { For } from "solid-js";

export interface ButtonGroupItem {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface ButtonGroupProps {
  dataSource: ButtonGroupItem[];
  label?: string;
  value?: string | number;
  onItemClick?: (value: string | number, item: ButtonGroupItem) => void;
  labelField?: string;
  valueField?: string;
  class?: string;
}

export function ButtonGroup(props: ButtonGroupProps) {
  const getItemLabel = (item: any) => {
    const field = props.labelField || "label";
    return item[field];
  };

  const getItemValue = (item: any) => {
    const field = props.valueField || "value";
    return item[field];
  };

  const handleClick = (item: any) => {
    if (props.onItemClick) {
      props.onItemClick(getItemValue(item), item);
    }
  };

  const isSelected = (item: any) => {
    return props.value === getItemValue(item);
  };

  return (
    <div>
      <p class="text-sm font-medium">{props.label}</p>
      <div class={`flex gap-2 overflow-x-auto py-1 ${props.class || ""}`}>
        <For each={props.dataSource}>
          {(item) => (
            <Button
              variant={isSelected(item) ? "default" : "outline"}
              size={"sm"}
              class={"shrink-0"}
              onClick={() => handleClick(item)}
            >
              {getItemLabel(item)}
            </Button>
          )}
        </For>
      </div>
    </div>
  );
}

export default ButtonGroup;
