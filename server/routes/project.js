import { Router } from "express";
import Project from "../model/Project.js";
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
    const getData = await Project.find({ userId: req.params.userId });

    res.json(getData);
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

router.post("/messages", async (req, res) => {
  try {
    const { projectId, text } = req.body;
    const updatedDocument = await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          messages: { text },
        },
      },
      { new: true }
    );
    res.status(200).json(updatedDocument);
  } catch (error) {
    res.status(500).json({ messages: "Server Error", error });
  }
});
export default router;
