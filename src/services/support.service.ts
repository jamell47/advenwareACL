import { prisma } from "../config/prisma";
import { env } from "../config/env";

export class SupportService {
  static async getSupportInfo(): Promise<any> {
    const config = await prisma.supportConfig.findFirst();

    return {
      whatsappNumber: config?.whatsappNumber || env.whatsappSupportNumber,
      supportEmail: config?.supportEmail || env.supportEmail,
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

  static async updateSupportConfig(data: {
    whatsappNumber?: string;
    supportEmail?: string;
    faqJson?: any;
  }): Promise<any> {
    const existing = await prisma.supportConfig.findFirst();

    if (existing) {
      return prisma.supportConfig.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.supportConfig.create({
      data,
    });
  }
}
