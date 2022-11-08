import { Router } from "express";

const r = Router();

r.get("/:videoId");
r.get("/:videoId/:commentid");

export default r;
