import * as projectService from "../services/projectService.js";

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.userId);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.userId); // from the token, not the URL
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectData = async (req, res, next) => {
  try {
    const project = await projectService.getProjectData(
      req.params.projectId,
      req.userId,
    );
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjectMessages = async (req, res, next) => {
  try {
    const messages = await projectService.getProjectMessages(
      req.params.projectId,
      req.userId,
    );
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const generateInviteLink = async (req, res, next) => {
  try {
    const result = await projectService.generateInviteLink(
      req.params.projectId,
      req.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const validateInviteToken = async (req, res, next) => {
  try {
    const result = await projectService.validateInviteToken(req.params.token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const joinProjectByInvite = async (req, res, next) => {
  try {
    // req.userId comes from verifyToken middleware
    const result = await projectService.joinProjectByInvite(
      req.params.token,
      req.userId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
