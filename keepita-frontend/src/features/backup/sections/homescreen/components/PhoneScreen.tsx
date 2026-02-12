import React, { useState } from "react";
import { cn } from "../../../../../shared/utils/cn";
import type {
  HomescreenFolder,
  HomescreenItem,
  HomescreenLayout,
} from "../types/homescreen.types";
import Folder from "./Folder";
import HomescreenAppIcon from "./HomescreenAppIcon";

interface PhoneScreenProps {
  layout: HomescreenLayout;
  currentScreen: number;
  onItemClick?: (item: HomescreenItem) => void;
  onScreenChange?: (screen: number) => void;
}

const PhoneScreen: React.FC<PhoneScreenProps> = ({
  layout,
  currentScreen,
  onItemClick,
  onScreenChange,
}) => {
  const [openFolderId, setOpenFolderId] = useState<number | null>(null);

  const getItemsForScreen = (screenIndex: number, location: string) => {
    return layout.items.filter(
      (item) => item.screen_index === screenIndex && item.location === location,
    );
  };

  const getFoldersForScreen = (screenIndex: number) => {
    return layout.folders.filter(
      (folder) => folder.screen_index === screenIndex,
    );
  };

  const getWidgetsForScreen = (screenIndex: number) => {
    return layout.items.filter(
      (item) =>
        item.screen_index === screenIndex &&
        item.location === "home" &&
        item.item_type === "widget",
    );
  };

  const getAppsForScreen = (screenIndex: number) => {
    return layout.items.filter(
      (item) =>
        item.screen_index === screenIndex &&
        item.location === "home" &&
        item.item_type === "app",
    );
  };

  const getOccupiedCells = (widgets: HomescreenItem[]) => {
    const occupied = new Set<string>();
    widgets.forEach((widget) => {
      const spanX = widget.span_x || 1;
      const spanY = widget.span_y || 1;
      for (let dy = 0; dy < spanY; dy++) {
        for (let dx = 0; dx < spanX; dx++) {
          occupied.add(`${widget.y + dy}-${widget.x + dx}`);
        }
      }
    });
    return occupied;
  };

  const createGrid = (
    apps: HomescreenItem[],
    folders: HomescreenFolder[],
    occupiedCells: Set<string>,
  ) => {
    const grid: (HomescreenItem | HomescreenFolder | null)[][] = Array(
      layout.rows,
    )
      .fill(null)
      .map(() => Array(layout.columns).fill(null));

    apps.forEach((item) => {
      const cellKey = `${item.y}-${item.x}`;
      if (
        item.y < layout.rows &&
        item.x < layout.columns &&
        !occupiedCells.has(cellKey)
      ) {
        grid[item.y][item.x] = item;
      }
    });

    folders.forEach((folder) => {
      const cellKey = `${folder.y}-${folder.x}`;
      if (
        folder.y < layout.rows &&
        folder.x < layout.columns &&
        !occupiedCells.has(cellKey)
      ) {
        grid[folder.y][folder.x] = folder;
      }
    });

    return grid;
  };

  const widgets = getWidgetsForScreen(currentScreen);
  const apps = getAppsForScreen(currentScreen);
  const hotseatItems = getItemsForScreen(currentScreen, "hotseat");
  const homeFolders = getFoldersForScreen(currentScreen);
  const occupiedCells = getOccupiedCells(widgets);
  const grid = createGrid(apps, homeFolders, occupiedCells);

  const handleFolderOpen = (folderId: number) => {
    setOpenFolderId(folderId);
  };

  const handleFolderClose = () => {
    setOpenFolderId(null);
  };

  const handleFolderAppClick = (app: HomescreenItem) => {
    onItemClick?.(app);
    setOpenFolderId(null);
  };

  const isFolder = (item: any): item is HomescreenFolder => {
    return item && "items" in item && "items_count" in item;
  };

  return (
    <div className="relative">
      <div className="relative bg-black rounded-[3rem] p-4 shadow-2xl mx-auto max-w-xs w-80">
        <div
          className="bg-gradient-to-b from-blue-500 to-purple-600 rounded-[2.5rem] p-3 h-[600px] flex flex-col relative overflow-hidden"
          style={{
            backgroundImage:
              layout.wallpapers.length > 0
                ? `url(${layout.wallpapers[0].image_url})`
                : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="h-6 flex justify-between items-center text-white text-xs font-medium mb-2">
            <div className="flex items-center gap-1">
              <span>9:41</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
              <span>100%</span>
            </div>
          </div>

          {layout.page_count > 1 && (
            <div className="flex justify-center mb-2">
              <div className="flex gap-1">
                {Array.from({ length: layout.page_count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onScreenChange?.(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      currentScreen === index
                        ? "bg-white"
                        : "bg-white/40 hover:bg-white/60",
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-1">
            <div
              className="grid gap-x-1 gap-y-0.5 h-full content-start pt-1"
              style={{
                gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
              }}
            >
              {widgets.map((widget) => {
                const spanX = widget.span_x || 1;
                const spanY = widget.span_y || 1;
                return (
                  <div
                    key={`widget-${widget.id}`}
                    className="flex items-center justify-center"
                    style={{
                      gridColumn: `${widget.x + 1} / span ${spanX}`,
                      gridRow: `${widget.y + 1} / span ${spanY}`,
                    }}
                  >
                    <div
                      className="w-full h-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center p-2 cursor-pointer hover:bg-white/30 transition-all"
                      onClick={() => onItemClick?.(widget)}
                      title={`${widget.class_name} (Widget ${spanX}x${spanY})`}
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        {widget.app_icon_url ? (
                          <img
                            src={widget.app_icon_url}
                            alt={widget.app_name || "Widget"}
                            className="w-8 h-8 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-purple-500/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">W</span>
                          </div>
                        )}
                        <span className="text-[9px] text-white/80 font-medium text-center truncate max-w-full">
                          {widget.app_name ||
                            widget.package_name.split(".").pop()}
                        </span>
                        <span className="text-[7px] text-white/50">
                          {spanX}×{spanY} Widget
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {grid.map((row, rowIndex) =>
                row.map((item, colIndex) => {
                  if (occupiedCells.has(`${rowIndex}-${colIndex}`)) {
                    return null;
                  }
                  return (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="flex items-center justify-center py-0.5"
                      style={{
                        gridColumn: colIndex + 1,
                        gridRow: rowIndex + 1,
                      }}
                    >
                      {item && (
                        <>
                          {isFolder(item) ? (
                            <Folder
                              folder={item}
                              isOpen={openFolderId === item.id}
                              onOpen={() => handleFolderOpen(item.id)}
                              onClose={handleFolderClose}
                              onAppClick={handleFolderAppClick}
                            />
                          ) : (
                            <HomescreenAppIcon
                              item={item}
                              size="sm"
                              onClick={onItemClick}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          </div>

          {hotseatItems.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2 mt-2">
              <div className="flex justify-center gap-2">
                {hotseatItems.slice(0, 4).map((item) => (
                  <HomescreenAppIcon
                    key={item.id}
                    item={item}
                    size="sm"
                    onClick={onItemClick}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="h-8 flex justify-center items-center mt-2">
            <div className="flex gap-8">
              <div className="w-6 h-1 bg-white/60 rounded-full"></div>
              <div className="w-6 h-6 border-2 border-white/60 rounded-full"></div>
              <div className="w-6 h-1 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-2 left-4 right-4 bg-gray-800 rounded-lg p-2 text-xs text-gray-300">
          <div className="flex justify-between">
            <span>
              Screen {currentScreen + 1}/{layout.page_count}
            </span>
            <span>
              {layout.rows}×{layout.columns}
            </span>
          </div>
        </div>
      </div>

      {layout.page_count > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => onScreenChange?.(Math.max(0, currentScreen - 1))}
            disabled={currentScreen === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
            {currentScreen + 1} / {layout.page_count}
          </span>
          <button
            onClick={() =>
              onScreenChange?.(
                Math.min(layout.page_count - 1, currentScreen + 1),
              )
            }
            disabled={currentScreen === layout.page_count - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneScreen;
