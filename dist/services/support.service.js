"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
class SupportService {
    static async getSupportInfo() {
        const config = await prisma_1.prisma.supportConfig.findFirst();
        return {
            whatsappNumber: config?.whatsappNumber || env_1.env.whatsappSupportNumber,
            supportEmail: config?.supportEmail || env_1.env.supportEmail,
            faq: config?.faqJson || null,
            supportCategories: [
                { id: "application", label: "Application Support", description: "Help with your application" },
                { id: "document", label: "Document Support", description: "Help with document uploads and review" },
                { id: "placement", label: "Placement Support", description: "Help with placement opportunities" },
                { id: "payment", label: "Payment Support", description: "Help with payments" },
                { id: "general", label: "General Support", description: "General inquiries" },
            ],
        };
    }
    static async updateSupportConfig(data) {
        const existing = await prisma_1.prisma.supportConfig.findFirst();
        if (existing) {
            return prisma_1.prisma.supportConfig.update({
                where: { id: existing.id },
                data,
            });
        }
        return prisma_1.prisma.supportConfig.create({
            data,
        });
    }
}
exports.SupportService = SupportService;
//# sourceMappingURL=support.service.js.map