
export interface IHttpResponse<T> {
  status: string;
  request: request;
  data: T;
}

interface request {
  path: string;
  year: string;
  month: string;
  date: string;
}