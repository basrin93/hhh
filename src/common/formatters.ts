import moment from 'moment'
moment.locale('ru')

export const fullDate = function (value: any) {
  if (value) {
    return moment(String(value)).format('DD MMMM YYYY HH:mm');
  }
};

export const shortDate = function (value: any) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY');
  }
};