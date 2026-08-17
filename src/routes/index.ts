import { Router } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import applicationRoutes from "./application.routes";
import documentRoutes from "./document.routes";
import placementRoutes from "./placement.routes";
import paymentRoutes from "./payment.routes";
import notificationRoutes from "./notification.routes";
import messagingRoutes from "./messaging.routes";
import supportRoutes from "./support.routes";
import adminRoutes from "./admin.routes";
import agentRoutes from "./agent.routes";
import organizationRoutes from "./organization.routes";
import commissionRoutes from "./commission.routes";
import withdrawalRoutes from "./withdrawal.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/applications", applicationRoutes);
router.use("/documents", documentRoutes);
router.use("/placements", placementRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/messaging", messagingRoutes);
router.use("/support", supportRoutes);
router.use("/admin", adminRoutes);
router.use("/agent", agentRoutes);
router.use("/organizations", organizationRoutes);
router.use("/commissions", commissionRoutes);
router.use("/withdrawals", withdrawalRoutes);
router.use("/reports", reportRoutes);

export default router;
