export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  page?: number | string;
  perPage?: number | string;
};
export type PaginateFunction = <
  T,
  K extends { where?: any; orderBy?: any; include?: any }
>(
  model: any,
  args?: K,
  options?: PaginateOptions
) => Promise<PaginatedResult<T>>;

export const paginator = (
  defaultOptions: PaginateOptions
): PaginateFunction => {
  return async (model, args: any = { where: undefined }, options) => {
    const page = Number(options?.page || defaultOptions?.page) || 1;
    const perPage = Number(options?.perPage || defaultOptions?.perPage) || 10;

    const take = Math.min(Number(perPage), 100);
    const skip = page > 0 ? take * (page - 1) : 0;

    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take,
        skip,
      }),
    ]);
    const lastPage = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        perPage: take,
        prev: page > 1 ? page - 1 : null,
        next: page < lastPage ? page + 1 : null,
      },
    };
  };
};

export const paginate: PaginateFunction = paginator({ page: 1, perPage: 10 });
