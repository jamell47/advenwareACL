"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const notification_schema_1 = require("../schemas/notification.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated student
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth_1.authenticate, (0, validation_1.validate)(notification_schema_1.NotificationQueryParamsSchema), notification_controller_1.NotificationController.getMyNotifications);
/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/unread-count", auth_1.authenticate, notification_controller_1.NotificationController.getUnreadCount);
/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:id/read", auth_1.authenticate, notification_controller_1.NotificationController.markAsRead);
/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/read-all", auth_1.authenticate, notification_controller_1.NotificationController.markAllAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth_1.authenticate, notification_controller_1.NotificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map