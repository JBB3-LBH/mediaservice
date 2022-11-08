import { Router } from "express";

const r = Router();

r.get("/:userId/home");
r.post("/search");
r.post("/autoComplete");
r.get("/:userId/trending");
r.get("/:userId/recommended");
r.get("/:userId/trending/:tag");
r.get("/:userId/history");
r.get("/:userId/watchLater");
r.get("/:userId/liked");
r.get("/:userId/subscriptions");
r.get("/subscriptions/videos");

export default r;
