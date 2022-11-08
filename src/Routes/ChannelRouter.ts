import { Router } from "express";

const r = Router();

r.get("/:channelId");
r.get("/:channelId/info");
r.get("/:channelId/subscribers");
r.get("/:channelId/videos");

export default r;
