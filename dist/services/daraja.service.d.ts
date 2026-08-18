export declare class DarajaService {
    private static readonly BASE_URL;
    private static readonly AUTH_URL;
    static getAccessToken(): Promise<string>;
    static initiateSTKPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string, userId: string): Promise<any>;
    static handleCallback(callbackData: any): Promise<void>;
    static initiateB2C(phoneNumber: string, amount: number, accountReference: string): Promise<any>;
    static handleB2CCallback(callbackData: any): Promise<void>;
}
//# sourceMappingURL=daraja.service.d.ts.map