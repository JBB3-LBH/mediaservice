import { Router } from "express";
import { AllComments } from "../controllers/CommentController";

const r = Router();

r.get("/:videoRef", AllComments); // comments for one video
r.get("/:videoRef/:prevId", AllComments); // comments for one video

export default r;
