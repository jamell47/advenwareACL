interface EnvConfig {
    nodeEnv: string;
    port: number;
    baseUrl: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtAccessExpiresIn: string;
    jwtRefreshExpiresIn: string;
    darajaConsumerKey: string;
    darajaConsumerSecret: string;
    darajaShortcode: string;
    darajaPasskey: string;
    darajaCallbackUrl: string;
    darajaEnvironment: string;
    storageEndpoint: string;
    storageAccessKey: string;
    storageSecretKey: string;
    storageBucket: string;
    uploadMaxSizeMb: number;
    whatsappSupportNumber: string;
    supportEmail: string;
    corsOrigin: string;
    rateLimitWindowMs: number;
    rateLimitMax: number;
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map