import { createContext } from "react";

export const gridItemDataAttribute = "data-grid-item-span";

export interface ResponsiveGridConfig {
  minColumnWidth: number;
  gap: number;
  columns: number;
}

export const ResponsiveGridContext = createContext<ResponsiveGridConfig | undefined>(undefined);
