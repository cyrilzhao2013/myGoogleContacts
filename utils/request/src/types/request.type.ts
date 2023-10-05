import { E_REQUEST_METHODS } from "../constants/request.const";

export interface IRequestConfig {
  host: string;
  baseUrl: string;
}

export interface IRequestParams {
  url: string;
  data?: any;
  method: E_REQUEST_METHODS;
  headers?: {
    [key: string]: string | number;
  };
}

export interface IRequest {
  send(params: IRequestParams): Promise<void>;
}
