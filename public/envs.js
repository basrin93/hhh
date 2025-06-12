var envs = {
  API_URL: "http://localhost:5000/",
  IDENTITY: {
    URL: "https://identity-stage.alfaleasing.ru/",
    CLIENT: "c-orii-ui",
    SECRET: "e8b24912-5862-6ac2-deed-a986f3de655b"
  },
  EMPLOYEE_PUBLISHER_URL: "https://employee-publisher-stage.yc.alfaleasing.ru/",
  fileStoreBaseUrl: "https://file-store.yc.alfaleasing.ru",
  FEATURES: {
    RANGE_FILTERS: true,
    ADDITIONAL_FILTERS: true,
    VALUATION_HISTORY: true,
    PHOTO_MANAGEMENT: true,
    EDIT_MODE: true,
    FEED_PAGE: true,
    ADVERTISEMENT: true
  },
  MINIO_HOST: 'https://storage.yandexcloud.net/',
};

window.SERVICE_ENVS = envs;