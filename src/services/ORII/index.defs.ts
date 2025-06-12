/** Generate by swagger-axios-codegen */
/* eslint-disable */
// @ts-nocheck
import axiosStatic, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface IRequestOptions extends AxiosRequestConfig {}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(method: string, contentType: string, url: string, options: any): IRequestConfig {
  const configs: IRequestConfig = { ...options, method, url };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType
  };
  return configs;
}

export const basePath = '';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T = any> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

export interface SampleApi_Dto_Models_SampleAddress {
  /**  */
  city?: string;

  /**  */
  street?: string;

  /**  */
  building?: string;
}

export interface SampleApi_Dto_Models_SampleRequest {
  /**  */
  first_name?: string;

  /**  */
  last_name?: string;

  /**  */
  address?: SampleApi_Dto_Models_SampleAddress;

  /**  */
  age?: number;

  /**  */
  email?: string;
}

export interface SampleApi_Dto_Models_SampleResponse {
  /**  */
  full_name?: string;

  /**  */
  address?: string;

  /**  */
  summary?: string;
}

import { AuthService } from '../core/AuthService';
import container from "../../inversify.config";
// Instance selector
export async function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
  const authService = container.get<AuthService>("AuthService");
  if (serviceOptions.axios) {

    var setAuth = authService.getUser().then((user) => 
    {
        if(user && user.access_token) {
          configs.headers['Authorization'] = "Bearer " + user.access_token;
        }
    });

    await setAuth;

    return serviceOptions.axios
      .request(configs)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}