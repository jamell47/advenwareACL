"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingService = void 0;
const prisma_1 = require("../config/prisma");
const auditLog_service_1 = require("./auditLog.service");
class SystemSettingService {
    static DEFAULT_SETTINGS = {
        placement_fee_amount: { value: "1500", type: "number", group: "placement", description: "Placement fee in KES" },
        commission_amount: { value: "500", type: "number", group: "commission", description: "Agent commission per placement in KES" },
        min_withdrawal_amount: { value: "100", type: "number", group: "withdrawal", description: "Minimum withdrawal amount in KES" },
        max_withdrawal_amount: { value: "50000", type: "number", group: "withdrawal", description: "Maximum withdrawal amount in KES" },
        student_application_fee: { value: "0", type: "number", group: "placement", description: "Application fee in KES (0 = free)" },
        enable_email_notifications: { value: "true", type: "boolean", group: "notifications", description: "Enable email notifications" },
        enable_sms_notifications: { value: "false", type: "boolean", group: "notifications", description: "Enable SMS notifications" },
        support_whatsapp_number: { value: "254116144095", type: "string", group: "support", description: "WhatsApp support number" },
        support_email: { value: "support@advenwarecareer.link", type: "string", group: "support", description: "Support email" },
    };
    static async getSettings() {
        const settings = await prisma_1.prisma.systemSetting.findMany();
        const result = {};
        for (const [key, defaultConfig] of Object.entries(this.DEFAULT_SETTINGS)) {
            const setting = settings.find((s) => s.key === key);
            result[key] = setting ? this.parseValue(setting.value, defaultConfig.type) : defaultConfig.value;
        }
        return {
            settings: result,
            raw: settings,
        };
    }
    static async getSettingsByGroup(group) {
        const settings = await prisma_1.prisma.systemSetting.findMany({
            where: { group },
        });
        const result = {};
        const groupDefaults = Object.entries(this.DEFAULT_SETTINGS).filter(([, config]) => config.group === group);
        for (const [key, defaultConfig] of groupDefaults) {
            const setting = settings.find((s) => s.key === key);
            result[key] = setting ? this.parseValue(setting.value, defaultConfig.type) : defaultConfig.value;
        }
        return result;
    }
    static async updateSetting(key, value, userId) {
        const defaultConfig = this.DEFAULT_SETTINGS[key];
        if (!defaultConfig) {
            throw new Error(`Unknown setting key: ${key}`);
        }
        const setting = await prisma_1.prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: {
                key,
                value,
                type: defaultConfig.type,
                group: defaultConfig.group,
                description: defaultConfig.description,
            },
        });
        await auditLog_service_1.AuditLogService.log("SYSTEM_SETTING_UPDATED", userId, "SystemSetting", setting.id, `Setting ${key} updated to value: ${value}`);
        return setting;
    }
    static async seedDefaultSettings() {
        for (const [key, config] of Object.entries(this.DEFAULT_SETTINGS)) {
            await prisma_1.prisma.systemSetting.upsert({
                where: { key },
                update: {
                    value: config.value,
                    type: config.type,
                    group: config.group,
                    description: config.description,
                },
                create: {
                    key,
                    value: config.value,
                    type: config.type,
                    group: config.group,
                    description: config.description,
                },
            });
        }
    }
    static async getCommissionConfig() {
        const [commissionSetting, minWithdrawalSetting, feeSetting] = await Promise.all([
            this.getSetting("commission_amount", "500"),
            this.getSetting("min_withdrawal_amount", "100"),
            this.getSetting("placement_fee_amount", "1500"),
        ]);
        return {
            amount: parseInt(commissionSetting, 10),
            minWithdrawal: parseInt(minWithdrawalSetting, 10),
            fee: parseInt(feeSetting, 10),
        };
    }
    static async getSetting(key, fallback) {
        const setting = await prisma_1.prisma.systemSetting.findUnique({
            where: { key },
        });
        return setting ? setting.value : fallback;
    }
    static parseValue(value, type) {
        switch (type) {
            case "number":
                return Number(value);
            case "boolean":
                return value === "true";
            case "string":
            default:
                return value;
        }
    }
}
exports.SystemSettingService = SystemSettingService;
//# sourceMappingURL=systemSetting.service.js.map