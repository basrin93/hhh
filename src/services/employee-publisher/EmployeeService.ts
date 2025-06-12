import { EmployeeInfoDto } from './Models/EmployeeModels';
import {
  IRequestOptions,
  serviceOptions,
  IRequestConfig,
  getConfigs,
  axios
} from './index.defs';

export class EmployeeService {
  static getEmployeeInfo(
    params: {
      /**  */
      guid: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<EmployeeInfoDto> {
    return new Promise((resolve, reject) => {
      let url = serviceOptions.axios?.defaults.baseURL + 'api/Employee/{guid}';
      url = url.replace('{guid}', params['guid'] + '');
      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      let data = null;
      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
}