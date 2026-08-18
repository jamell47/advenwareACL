interface CreateConversationData {
    type: "SUPPORT" | "AGENT";
    subject?: string;
}
interface SendMessageData {
    message: string;
    attachmentUrl?: string;
    attachmentName?: string;
}
export declare class MessagingService {
    static getConversations(userId: string): Promise<any[]>;
    static createConversation(userId: string, data: CreateConversationData): Promise<any>;
    static getConversationMessages(userId: string, conversationId: string): Promise<any>;
    static sendMessage(userId: string, conversationId: string, data: SendMessageData): Promise<any>;
    static markMessagesAsRead(userId: string, conversationId: string): Promise<void>;
}
export {};
//# sourceMappingURL=messaging.service.d.ts.map