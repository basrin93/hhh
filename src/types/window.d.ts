interface ServiceEnvs {
    API_URL: string;
    IDENTITY: {
        URL: string;
        CLIENT: string;
        SECRET: string;
    };
    EMPLOYEE_PUBLISHER_URL: string;
}

declare global {
    interface Window {
        SERVICE_ENVS: ServiceEnvs;
    }
}

export {};