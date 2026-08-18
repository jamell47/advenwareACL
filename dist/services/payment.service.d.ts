export declare class PaymentService {
    static getMyPayments(userId: string): Promise<any[]>;
    static getPaymentById(userId: string, paymentId: string): Promise<any>;
    static initiateSTKPush(userId: string, phoneNumber: string): Promise<any>;
    static handleCallback(callbackData: any): Promise<any>;
    private static formatPayment;
}
//# sourceMappingURL=payment.service.d.ts.map