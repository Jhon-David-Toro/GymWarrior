import { type ComponentProps } from "react";

export interface PageContainerProps extends ComponentProps<"div"> {
  narrow?: boolean;
}
