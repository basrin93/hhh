const validations = {
  required: (v: any) => !!v || 'Поле обязательно к заполнению',
  restriction: (pattern: RegExp) => (v: string | null) =>
    !v || pattern.test(v) || 'Некорректное значение',
  length: (len: number) => (v: string | null) =>
    !v || v.length === len || `Допустимая длина ${len} символов`,
  integerOnly: (v: string | null) =>
    !v || /^[0-9]+$/.test(v) || 'Разрешены только цифры',
};
  
export default validations;