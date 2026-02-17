import { Router } from "express";
import Project from "../model/Project.js";
import Message from "../model/Message.js";
import crypto from "crypto";
import { verifyToken } from "../middleware/verifyToken.js";
const router = Router();

router.post("/create", async (req, res) => {
  try {
    const { name, userId } = req.body;
    const project = await Project.create({ name, userId });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json(error);
  }
});
// get all project for showing in frontend
router.get("/all/:userId", async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ userId: req.params.userId }, { members: req.params.userId }],
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ messages: "Server Error" });
  }
});

router.get("/data/:projectId", async (req, res) => {
  try {
    const projectData = await Project.findById(req.params.projectId);
    res.json(projectData);
  } catch (error) {
    res.status(500).json({ messages: "Server Error" });
  }
});

router.get("/messages/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/invite-link/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const { userId } = req.body;

    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ message: "Invalid Link" });
    if (project.userId !== userId) {
      res.status(403).json({ message: "Not Allowed." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    project.inviteToken = token;
    project.inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await project.save();

    res.json({ inviteLink: `http://localhost:5173/invite/${token}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/invite-project/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const project = await Project.findOne({ inviteToken: token });

    if (!project) return res.status(404).json({ message: "Invalid Link" });

    if (project.inviteExpires < Date.now()) {
      return res.status(400).json({ message: "Link Expired" });
    }

    return res.json({
      projectId: project._id,
      projectName: project.name,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/invite-join/:token", verifyToken, async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId;

    const project = await Project.findOne({ inviteToken: token });

    if (!project) return res.status(404).json({ message: "Invalid Token" });

    if (project.members.includes(userId))
      return res.json({ message: "Already Exist." });

    project.members.push(userId);

    await project.save();
  } catch (error) {
    console.log(error);
  }
});

router.put("/file/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const { fileName, content } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const file = project.files.find((f) => f.name === fileName);
    if (file) {
      file.content = content;
    } else {
      project.files.push({ name: fileName, content });
    }

    await project.save();

    res.status(201).json({ message: "File saved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error saving file." });
  }
});

router.get("/files/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    res.json(project.files);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
