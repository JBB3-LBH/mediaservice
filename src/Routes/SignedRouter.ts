import { Router } from "express";
import { signAllScene, signOne, signOneScene } from "../controllers/SignedController";

const r = Router();

r.get("/one",signOne); //sign a path
r.get("/oneScene",signOneScene); //sign a scene
r.post("/Scenes",signAllScene); //sign scenes

export default r;
