type DashboardOverviewResponsePhoneModels = {
  device_name: string;
  upload_count: number;
};

type DashboardOverviewResponseMedias = {
  videos_count: number;
  images_count: number;
  musics_count: number;
  others: number;
};

export type DashboardOverviewResponseUploadsOverview = {
  date: string;
  count: number;
};

type DashboardOverviewResponseFrequentlyCalledContacts = {
  name: string;
  phone_model: string;
  call_count: number;
};

export type DashboardOverviewResponse = {
  phone_models: DashboardOverviewResponsePhoneModels[];
  frequently_called_contacts: DashboardOverviewResponseFrequentlyCalledContacts[];
  messages_count: number;
  apps_count: number;
  contacts_count: number;
  calls_count: number;
  medias: DashboardOverviewResponseMedias;
  uploads_overview: DashboardOverviewResponseUploadsOverview[];
};

export type DashboardOverviewResponseStats = Pick<
  DashboardOverviewResponse,
  "messages_count" | "apps_count" | "contacts_count" | "calls_count"
>;
