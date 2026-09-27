import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createProject,
  getAllProjects,
  getProjectData,
  getProjectMessages,
  generateInviteLink,
  validateInviteToken,
  joinProjectByInvite,
} from "../controller/projectController.js";

const router = Router();

// projects
router.post("/create", verifyToken, createProject);
router.get("/all", verifyToken, getAllProjects);
router.get("/data/:projectId", verifyToken, getProjectData);

// message
router.get("/messages/:projectId", verifyToken, getProjectMessages);

// invite
router.post("/invite-link/:projectId", verifyToken, generateInviteLink);
router.get("/invite-project/:token", validateInviteToken);
router.post("/invite-join/:token", verifyToken, joinProjectByInvite);

export default router;
