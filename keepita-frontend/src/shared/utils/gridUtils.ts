export const GRID_BREAKPOINTS = {
  mobile: { columns: 2, minWidth: 0 },
  sm: { columns: 3, minWidth: 640 },
  md: { columns: 4, minWidth: 768 },
  lg: { columns: 5, minWidth: 1024 },
  xl: { columns: 6, minWidth: 1280 },
} as const;

export const calculateGridColumns = (containerWidth: number): number => {
  const breakpoints = Object.values(GRID_BREAKPOINTS);

  for (let i = breakpoints.length - 1; i >= 0; i--) {
    if (containerWidth >= breakpoints[i].minWidth) {
      return breakpoints[i].columns;
    }
  }

  return GRID_BREAKPOINTS.mobile.columns;
};

export const getResponsiveGridClasses = (): string => {
  return "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
};

export const calculateGridItemDimensions = (
  containerWidth: number,
  gap: number = 12,
) => {
  const columns = calculateGridColumns(containerWidth);
  const totalGapWidth = (columns - 1) * gap;
  const availableWidth = containerWidth - totalGapWidth;
  const itemWidth = Math.floor(availableWidth / columns);

  return {
    itemWidth,
    itemHeight: itemWidth + 40,
    columns,
  };
};

export const calculateAnimationDelay = (
  index: number,
  baseDelay: number = 0.03,
  maxDelay: number = 0.5,
): number => {
  return Math.min(index * baseDelay, maxDelay);
};

export class GridVirtualizer {
  private itemHeight: number;
  private columns: number;
  private rowsVisible: number;

  constructor(
    containerHeight: number,
    itemHeight: number,
    columns: number,
    buffer: number = 2,
  ) {
    this.itemHeight = itemHeight;
    this.columns = columns;
    this.rowsVisible = Math.ceil(containerHeight / itemHeight) + buffer;
  }

  getVisibleRange(scrollTop: number, totalItems: number) {
    const startRow = Math.floor(scrollTop / this.itemHeight);
    const endRow = Math.min(
      startRow + this.rowsVisible,
      Math.ceil(totalItems / this.columns),
    );

    return {
      startIndex: startRow * this.columns,
      endIndex: Math.min(endRow * this.columns, totalItems),
      startRow,
      endRow,
    };
  }
}

export default {
  GRID_BREAKPOINTS,
  calculateGridColumns,
  getResponsiveGridClasses,
  calculateGridItemDimensions,
  calculateAnimationDelay,
  GridVirtualizer,
};
