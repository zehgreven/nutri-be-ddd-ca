export type Paging<T> = {
  page: number;
  limit: number;
  order?: 'asc' | 'desc';
  orderBy?: keyof T;
};

export type Paginated<T> = {
  page: number;
  limit: number;
  count: number;
  rows: T[];
};
