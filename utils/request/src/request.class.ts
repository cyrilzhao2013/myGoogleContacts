import { IRequest, IRequestConfig, IRequestParams } from "./types/request.type";

class Request implements IRequest {
  private config: IRequestConfig;

  constructor(options: IRequestConfig) {
    this.config = options;
  }

  send<T>(params: IRequestParams): Promise<T> {
    return Promise.resolve(11 as T);
  }
}

export const request = new Request({
  baseUrl: "",
  host: "",
});
