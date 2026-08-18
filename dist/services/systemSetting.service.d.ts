export declare class SystemSettingService {
    static DEFAULT_SETTINGS: {
        placement_fee_amount: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        commission_amount: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        min_withdrawal_amount: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        max_withdrawal_amount: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        student_application_fee: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        enable_email_notifications: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        enable_sms_notifications: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        support_whatsapp_number: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
        support_email: {
            value: string;
            type: string;
            group: string;
            description: string;
        };
    };
    static getSettings(): Promise<any>;
    static getSettingsByGroup(group: string): Promise<any>;
    static updateSetting(key: string, value: string, userId?: string): Promise<any>;
    static seedDefaultSettings(): Promise<void>;
    static getCommissionConfig(): Promise<{
        amount: number;
        minWithdrawal: number;
        fee: number;
    }>;
    private static getSetting;
    private static parseValue;
}
//# sourceMappingURL=systemSetting.service.d.ts.map