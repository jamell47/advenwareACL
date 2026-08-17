import { Router } from "express";
import { AgentController } from "../controllers/agent.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Agent Manager
 *   description: Agent management (admin-only)
 */

router.use(authenticate);

/**
 * @swagger
 * /agent/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agent Manager]
 *     security:
 *       - bearerAuth: []
 */
router.get("/agents", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, AgentController.getAgents);

router.get("/agents/:id", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, AgentController.getAgentById);

router.post("/agents/:id/approve", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, AgentController.approveAgent);

router.post("/agents/:id/suspend", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, AgentController.suspendAgent);

router.post("/agents/:id/activate", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, AgentController.activateAgent);

/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: Agent dashboard and own operations
 */

/**
 * @swagger
 * /agent/dashboard:
 *   get:
 *     summary: Get agent dashboard stats
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.getDashboard);

/**
 * @swagger
 * /agent/students:
 *   get:
 *     summary: Get students registered by the authenticated agent
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.getMyStudents);

/**
 * @swagger
 * /agent/students/register:
 *   post:
 *     summary: Register a student (agent-only)
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students/register", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.registerStudent);

/**
 * @swagger
 * /agent/commissions:
 *   get:
 *     summary: Get agent's commissions
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get("/commissions", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.getMyCommissions);

/**
 * @swagger
 * /agent/withdrawals:
 *   get:
 *     summary: Get agent's withdrawals
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.get("/withdrawals", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.getMyWithdrawals);

/**
 * @swagger
 * /agent/withdrawals/request:
 *   post:
 *     summary: Request a withdrawal (agent-only)
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 */
router.post("/withdrawals/request", (req, res, next) => {
  if (req.user!.role === "AGENT") return next();
  res.status(403).json({ success: false, message: "Agent access required" });
}, AgentController.requestWithdrawal);

export default router;
