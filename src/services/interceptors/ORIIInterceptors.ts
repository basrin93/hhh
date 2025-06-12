import axios from 'axios';
import { AxiosInterceptors } from '../core/AxiosInterceptors';
import { serviceOptions } from '../ORII/index.defs';

export class ORIIInterceptors extends AxiosInterceptors {
  constructor () {
    let axiosInstance = axios.create({
      baseURL: window["SERVICE_ENVS"].API_URL
    });
    super(axiosInstance);
    serviceOptions.axios = axiosInstance;
  }
}