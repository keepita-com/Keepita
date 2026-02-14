import type { ApiResponseList } from "../../../../../core/types/apiResponse";

export interface App {
  id: number;
  apk_name: string;
  icon: string;
  icon_url: string;
  version_name: string;
  size: number;
  size_mb: number;
  last_time_used: string;
  recent_used: boolean;
  permissions_count: number;
  created_at: string;
}

export interface AppPermission {
  id: number;
  permission_name: string;
  label: string;
  description: string;
  protection_level: number;
  permission_group: string | null;
  is_granted: boolean;
  is_dangerous: boolean;
  app: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface AppStats {
  total: number;
  recentlyUsed: number;
}

export type AppCategory =
  | "communication"
  | "entertainment"
  | "game"
  | "lifestyle"
  | "music"
  | "news"
  | "photography"
  | "productivity"
  | "social"
  | "tools"
  | "travel"
  | "education"
  | "finance"
  | "health"
  | "shopping"
  | "sports"
  | "weather"
  | "business"
  | "maps"
  | "medical"
  | "auto"
  | "house_home"
  | "dating"
  | "parenting"
  | "art_design"
  | "events"
  | "comics"
  | "libraries_demo"
  | "personalization"
  | "video_players"
  | "food_drink"
  | "beauty"
  | "books_reference"
  | "system"
  | "other";

export type AppViewMode = "list" | "grid";

export interface GetAppParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_system?: boolean;
  is_enabled?: boolean;
  category?: AppCategory;
}

export interface GetAppPermissionsParams {
  page?: number;
  page_size?: number;
}

export interface AppFilters {
  search?: string;
  is_system?: boolean;
  is_enabled?: boolean;
  category?: AppCategory;
}

export interface AppSortConfig {
  field:
    | "apk_name"
    | "package_name"
    | "size"
    | "install_time"
    | "update_time"
    | "permissions_count";
  direction: "asc" | "desc";
}

export interface AppsResponse extends ApiResponseList<App[]> {}

export interface AppPermissionsResponse {
  app: App;
  permissions: {
    count: number;
    next: string | null;
    previous: string | null;
    results: AppPermission[];
  };
  stats: {
    total_permissions: number;
    unique_groups: number;
    protection_levels: number[];
  };
}
