import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export type ItemType = "app" | "widget" | "folder";

export type LocationType =
  | "home"
  | "hotseat"
  | "homeOnly"
  | "hotseat_homeOnly"
  | "appOrder";

export type WallpaperType = "home" | "lock";

export interface HomescreenItem {
  id: number;
  item_type: ItemType;
  screen_index: number;
  x: number;
  y: number;
  span_x: number | null;
  span_y: number | null;
  package_name: string;
  class_name: string;
  title: string | null;
  app_widget_id: number | null;
  is_hidden: boolean;
  location: LocationType;
  created_at: string;
  app_icon_url: string;
  app_name: string;
}

export interface HomescreenFolder {
  id: number;
  title: string | null;
  screen_index: number;
  x: number;
  y: number;
  color: number;
  options: number;
  items: HomescreenItem[];
  items_count: number;
  created_at: string;
}

export interface HomescreenWallpaper {
  id: number;
  type: WallpaperType;
  original_path: string;
  image_url: string;
  is_default: boolean;
  created_at: string;
}

export interface HomescreenLayout {
  id: number;
  rows: number;
  columns: number;
  page_count: number;
  has_zero_page: boolean;
  is_portrait_only: boolean;
  notification_panel_enabled: boolean;
  layout_locked: boolean;
  quick_access_enabled: boolean;
  badge_enabled: boolean;
  folders: HomescreenFolder[];
  items: HomescreenItem[];
  wallpapers: HomescreenWallpaper[];
  created_at: string;
  app_icon_url: string;
  app_name: string;
}

export interface HomescreenFilters {
  item_type?: ItemType;
  location?: LocationType;
  screen_index?: number;
  is_hidden?: boolean;
  search?: string;
  created_from?: string;
  created_to?: string;
}

export interface HomescreenSortConfig {
  field: "created_at" | "screen_index" | "package_name" | "item_type";
  direction: "asc" | "desc";
}

export interface HomescreenListResponse extends ApiResponseList<
  HomescreenLayout[]
> {}

export interface HomescreenQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  item_type?: ItemType;
  location?: LocationType;
  screen_index?: number;
  is_hidden?: boolean;
  created_from?: string;
  created_to?: string;
}
