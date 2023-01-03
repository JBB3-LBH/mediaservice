import { Router } from "express";
import { AllComments, TotalComments } from "../controllers/CommentController";

const r = Router();

r.get("/:videoRef", AllComments); // comments for one video
r.get("/:videoRef/:prevId", AllComments); // comments for one video
r.get("/Count/:videoRef", TotalComments); //route to get amount of comments in a video

export default r;
