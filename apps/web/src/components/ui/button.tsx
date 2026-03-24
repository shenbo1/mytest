import type { JSX, ValidComponent } from "solid-js";
import { splitProps, createSignal } from "solid-js";

import * as ButtonPrimitive from "@kobalte/core/button";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps<T extends ValidComponent = "button"> =
  ButtonPrimitive.ButtonRootProps<T> &
    VariantProps<typeof buttonVariants> & {
      class?: string | undefined;
      children?: JSX.Element;
    };

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>,
) => {
  const [local, others] = splitProps(props as ButtonProps, [
    "variant",
    "size",
    "class",
  ]);
  return (
    <ButtonPrimitive.Root
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...others}
    />
  );
};

// 极简的 AsyncButton - 直接复用 Button 的所有 props
interface AsyncButtonProps<T extends ValidComponent = "button"> 
  extends Omit<ButtonProps<T>, 'onClick'> {
  loadingText?: string
  onClick?: (e: MouseEvent) => void | Promise<void>
}

/**
 * AsyncButton - 自动管理 loading 状态的按钮
 * 基于 Button 组件的简单封装，点击后自动显示加载状态
 */
const AsyncButton = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, AsyncButtonProps<T>>
) => {
  const [local, others] = splitProps(props as AsyncButtonProps, [
    "loadingText",
    "children",
    "onClick"
  ])

  const [loading, setLoading] = createSignal(false)

  const handleClick = async (e: MouseEvent) => {
    if (!local.onClick) return
    
    try {
      setLoading(true)
      await local.onClick(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      disabled={loading()}
      onClick={handleClick}
      {...others}
    >
      {loading() && (
        <svg class="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {loading() ? (local.loadingText || local.children) : local.children}
    </Button>
  )
}

export { Button, buttonVariants, AsyncButton }
export type { ButtonProps, AsyncButtonProps }
