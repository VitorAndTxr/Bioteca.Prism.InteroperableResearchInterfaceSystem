/// <reference types="vite/client" />

declare global {
    interface ImportMetaEnv {
        readonly VITE_API_URL?: string;
        readonly VITE_IRN_MIDDLEWARE_SUBJECT_NAME?: string;
        readonly VITE_IRN_MIDDLEWARE_CERTIFICATE?: string;
        readonly VITE_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY?: string;
        readonly VITE_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD?: string;
        readonly VITE_IRN_MIDDLEWARE_VALID_FROM?: string;
        readonly VITE_IRN_MIDDLEWARE_VALID_TO?: string;
        readonly VITE_IRN_MIDDLEWARE_THUMBPRINT?: string;
        readonly VITE_IRN_MIDDLEWARE_SERIAL_NUMBER?: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

export {};
