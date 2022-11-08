import { Router } from "express";

const r = Router();

r.get("/home");
r.post("/search");
r.post("/autoComplete");
r.get("/trending");
r.get("/recommended");
r.get("/trending/:tag");
r.get("/history");
r.get("/watchLater");
r.get("/liked");
r.get("/subscriptions");
r.get("/home");
r.get("/:videoId");

export default r;
