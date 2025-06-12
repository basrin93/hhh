import axios from 'axios';
import { AxiosInterceptors } from '../core/AxiosInterceptors';
import { serviceOptions } from '../employee-publisher/index.defs';

export class EmployeePublisherInterceptors extends AxiosInterceptors {
  constructor () {
    let axiosInstance = axios.create({
      baseURL: window["SERVICE_ENVS"].EMPLOYEE_PUBLISHER_URL
    });
    super(axiosInstance);
    serviceOptions.axios = axiosInstance;
  }
}