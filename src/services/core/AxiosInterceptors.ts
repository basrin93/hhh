import { AxiosInstance } from 'axios';
import { AuthService } from './AuthService';
import container from "../../inversify.config";
import notify from '../../components/notifications/NotificationService';
const authService = container.get<AuthService>("AuthService");

export class AxiosInterceptors {
  constructor(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          notify.pushError(error.message ?? 'Невозможно получить данные');
        } else {
          switch (error.response.status) {
            case 400:
              notify.pushError(JSON.stringify(error.response.data.errors) ?? 'Невозможно получить данные');
              break;
            case 401:
              notify.pushError('Требуется авторизация');
              authService.logout();
              break;
            case 403:
              notify.pushError('Недостаточно прав');
              break;
            default:
              notify.pushError(error.response.data?.Title ?? 'Невозможно получить данные');
              break;
          }
        }
        throw error;
      }
    );
  }
}