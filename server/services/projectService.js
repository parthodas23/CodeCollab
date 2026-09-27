import crypto from "crypto";
import Project from "../model/Project.js";
import Message from "../model/Message.js";
import { ENV } from "../lib/ENV.js";

const isMember = (project, userId) =>
  project.userId === userId || project.members.includes(userId);

// project CRUD

export const createProject = async ({ name }, userId) => {
  if (!name?.trim()) {
    throw { status: 400, message: "Project name is required." };
  }

  const project = await Project.create({
    name: name.trim(),
    userId,
    members: [userId], // owner is a member
  });

  return project;
};

export const getAllProjects = async (userId) => {
  const projects = await Project.find({
    $or: [{ userId }, { members: userId }],
  }).select("-files");

  return projects;
};

// only members of the project can read it
export const getProjectData = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw { status: 404, message: "Project not found." };
  }

  if (!isMember(project, userId)) {
    throw { status: 403, message: "You are not a member of this project." };
  }

  return project;
};

// messages

export const getProjectMessages = async (projectId, userId) => {
  await getProjectData(projectId, userId);
  const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
  return messages;
};

// invite

export const generateInviteLink = async (projectId, requestingUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw { status: 404, message: "Project not found." };
  }

  if (project.userId.toString() !== requestingUserId.toString()) {
    throw {
      status: 403,
      message: "Only the project owner can invite members.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  project.inviteToken = token;
  project.inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await project.save();

  const baseUrl = ENV.CLIENT_URL || "http://localhost:5173";
  return { inviteLink: `${baseUrl}/invite/${token}` };
};

export const validateInviteToken = async (token) => {
  const project = await Project.findOne({ inviteToken: token });

  if (!project) {
    throw { status: 404, message: "Invalid invite link." };
  }

  if (project.inviteExpires < Date.now()) {
    throw { status: 410, message: "This invite link has expired." };
    // 410 - gone or expired
  }

  return { projectId: project._id, projectName: project.name };
};

export const joinProjectByInvite = async (token, userId) => {
  const project = await Project.findOne({ inviteToken: token });

  if (!project) {
    throw { status: 404, message: "Invalid invite link." };
  }

  if (project.inviteExpires < Date.now()) {
    throw { status: 410, message: "This invite link has expired." };
  }

  if (!isMember(project, userId)) {
    project.members.push(userId);
    await project.save();
  }

  return { projectId: project._id };
};
