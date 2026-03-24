import { type JSX, splitProps } from "solid-js";

import { cn } from "~/lib/utils";

interface CardItemProps {
  label: string | JSX.Element;
  value: string | number | JSX.Element;
  class?: string;
  itemClass?: string;
}

export function CardItem(props: CardItemProps) {
  const [local, others] = splitProps(props, [
    "label",
    "value",
    "class",
    "itemClass",
  ]);

  return (
    <div
      class={cn("flex justify-between items-center", local.class)}
      {...others}
    >
      <span class="text-sm text-muted-foreground">{local.label}</span>
      <span class={cn("text-sm font-medium", local.itemClass)}>
        {local.value}
      </span>
    </div>
  );
}
