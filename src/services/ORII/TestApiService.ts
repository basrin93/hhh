import {
  SampleApi_Dto_Models_SampleRequest,
  SampleApi_Dto_Models_SampleAddress,
  SampleApi_Dto_Models_SampleResponse,
  IList,
  List,
  IListResult,
  ListResultDto,
  IPagedResult,
  PagedResultDto,
  Dictionary,
  IDictionary,
  IRequestOptions,
  IRequestConfig,
  getConfigs,
  axios,
  basePath
} from './index.defs';

export class TestApiService {
  /** Generate by swagger-axios-codegen */
  // @ts-nocheck
  /* eslint-disable */

  /**
   *
   */
  static message(
    params: {
      /**  */
      testRequest: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/Test/message';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { testRequest: params['testRequest'] };
      let data = null;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   *
   */
  static sample(
    params: {
      /** requestBody */
      body?: SampleApi_Dto_Models_SampleRequest;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<SampleApi_Dto_Models_SampleResponse> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/Test/sample';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params.body;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
}