/**
 * 공통 api result
 */
export interface IApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
