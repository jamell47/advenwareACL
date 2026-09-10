"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class MessagingService {
    static async getConversations(userId) {
        const conversations = await prisma_1.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { sentAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                receiverId: userId,
                                isRead: false,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
        return conversations.map((conv) => {
            const otherParticipant = conv.participants.find((p) => p.userId !== userId);
            const lastMessage = conv.messages[0];
            return {
                id: conv.id,
                subject: conv.subject,
                isResolved: conv.isResolved,
                otherParticipant: otherParticipant
                    ? {
                        id: otherParticipant.user.id,
                        name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName || ""}`,
                        role: otherParticipant.user.role,
                    }
                    : null,
                lastMessage: lastMessage
                    ? {
                        message: lastMessage.message,
                        sentAt: lastMessage.sentAt,
                        isRead: lastMessage.isRead,
                        isOwn: lastMessage.senderId === userId,
                    }
                    : null,
                unreadCount: conv._count.messages,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
            };
        });
    }
    static async createConversation(userId, data) {
        const studentProfile = await prisma_1.prisma.studentProfile.findUnique({
            where: { userId },
        });
        if (!studentProfile) {
            throw new errorHandler_1.APIError("Student profile not found", 404, "PROFILE_NOT_FOUND");
        }
        const conversation = await prisma_1.prisma.conversation.create({
            data: {
                studentId: userId,
                subject: data.subject || `Support Request: ${new Date().toISOString().split("T")[0]}`,
                participants: {
                    create: [{ userId, role: client_1.ConversationParticipantRole.STUDENT }],
                },
            },
        });
        if (data.type === "SUPPORT") {
            const supportUser = await prisma_1.prisma.user.findFirst({
                where: { role: "SUPPORT" },
            });
            if (supportUser) {
                await prisma_1.prisma.conversationParticipant.create({
                    data: {
                        conversationId: conversation.id,
                        userId: supportUser.id,
                        role: client_1.ConversationParticipantRole.SUPPORT,
                    },
                });
            }
        }
        else if (data.type === "AGENT") {
            const student = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: { agentId: true },
            });
            if (student?.agentId) {
                await prisma_1.prisma.conversationParticipant.create({
                    data: {
                        conversationId: conversation.id,
                        userId: student.agentId,
                        role: client_1.ConversationParticipantRole.AGENT,
                    },
                });
                await prisma_1.prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { agentId: student.agentId },
                });
            }
        }
        return {
            id: conversation.id,
            subject: conversation.subject,
            isResolved: conversation.isResolved,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    static async createAgentConversation(agentId, studentId, subject) {
        const student = await prisma_1.prisma.user.findUnique({
            where: { id: studentId },
            select: { agentId: true, studentProfile: { select: { id: true } } },
        });
        if (!student || !student.studentProfile) {
            throw new errorHandler_1.APIError("Student not found", 404, "STUDENT_NOT_FOUND");
        }
        if (student.agentId !== agentId) {
            throw new errorHandler_1.APIError("You can only message your own students", 403, "FORBIDDEN");
        }
        const existingConversation = await prisma_1.prisma.conversation.findFirst({
            where: { studentId, agentId },
        });
        if (existingConversation) {
            return {
                id: existingConversation.id,
                subject: existingConversation.subject,
                isResolved: existingConversation.isResolved,
                createdAt: existingConversation.createdAt,
                updatedAt: existingConversation.updatedAt,
            };
        }
        const conversation = await prisma_1.prisma.conversation.create({
            data: {
                studentId,
                agentId,
                subject: subject || `Conversation with student`,
                participants: {
                    create: [
                        { userId: studentId, role: client_1.ConversationParticipantRole.STUDENT },
                        { userId: agentId, role: client_1.ConversationParticipantRole.AGENT },
                    ],
                },
            },
        });
        return {
            id: conversation.id,
            subject: conversation.subject,
            isResolved: conversation.isResolved,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
    static async getConversationMessages(userId, conversationId) {
        const participant = await prisma_1.prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
        });
        if (!participant) {
            throw new errorHandler_1.APIError("Conversation not found or access denied", 404, "CONVERSATION_NOT_FOUND");
        }
        await prisma_1.prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: userId,
                isRead: false,
            },
            data: { isRead: true, readAt: new Date() },
        });
        const messages = await prisma_1.prisma.message.findMany({
            where: { conversationId },
            orderBy: { sentAt: "asc" },
        });
        const conversation = await prisma_1.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        const participantMap = new Map(conversation?.participants.map((p) => [p.userId, p]));
        const otherParticipant = conversation?.participants.find((p) => p.userId !== userId);
        return {
            id: conversation?.id,
            subject: conversation?.subject,
            isResolved: conversation?.isResolved,
            otherParticipant: otherParticipant
                ? {
                    id: otherParticipant.user.id,
                    name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName || ""}`,
                    role: otherParticipant.user.role,
                }
                : null,
            messages: messages.map((msg) => ({
                id: msg.id,
                message: msg.message,
                senderId: msg.senderId,
                isOwn: msg.senderId === userId,
                isRead: msg.isRead,
                sentAt: msg.sentAt,
                attachmentUrl: msg.attachmentUrl,
                attachmentName: msg.attachmentName,
            })),
        };
    }
    static async sendMessage(userId, conversationId, data) {
        const participant = await prisma_1.prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
        });
        if (!participant) {
            throw new errorHandler_1.APIError("Conversation not found or access denied", 404, "CONVERSATION_NOT_FOUND");
        }
        const conversation = await prisma_1.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    where: { userId: { not: userId } },
                },
            },
        });
        if (!conversation) {
            throw new errorHandler_1.APIError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
        }
        const receiverId = conversation.participants[0]?.userId;
        if (!receiverId) {
            throw new errorHandler_1.APIError("No recipient found for this conversation", 400, "NO_RECIPIENT");
        }
        const message = await prisma_1.prisma.$transaction(async (tx) => {
            const msg = await tx.message.create({
                data: {
                    conversationId,
                    senderId: userId,
                    receiverId,
                    message: data.message,
                    attachmentUrl: data.attachmentUrl,
                    attachmentName: data.attachmentName,
                },
            });
            await tx.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessageId: msg.id,
                    updatedAt: new Date(),
                },
            });
            return msg;
        });
        return {
            id: message.id,
            message: message.message,
            senderId: message.senderId,
            isOwn: true,
            isRead: false,
            sentAt: message.sentAt,
            attachmentUrl: message.attachmentUrl,
            attachmentName: message.attachmentName,
        };
    }
    static async markMessagesAsRead(userId, conversationId) {
        await prisma_1.prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: userId,
                isRead: false,
            },
            data: { isRead: true, readAt: new Date() },
        });
    }
}
exports.MessagingService = MessagingService;
//# sourceMappingURL=messaging.service.js.map