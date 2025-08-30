export interface ApiResponse<DataType> {
  message: string;
  data: DataType;
  status: boolean;
}

export interface ApiResponseList<DataType> {
  result_count: number;
  total_pages: number;
  next_page: string | null;
  previous_page: string | null;
  has_next: boolean;
  has_previous: boolean;
  total_results: number;
  current_page: number;
  results: DataType;
}

export class ApiResponseConstructor<DataType> implements ApiResponse<DataType> {
  message: string;
  data: DataType;
  status: boolean;

  constructor(message: string, data: DataType, status: boolean) {
    this.message = message;
    this.data = data;
    this.status = status;
  }
}
