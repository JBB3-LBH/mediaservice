import { Router } from "express";

const r = Router();

r.get("/:videoId/main");
r.get("/:videoId/allActivity");
r.get("/:videoId/likes_N_Dislikes");
r.get("/:videoId/views");

export default r;
