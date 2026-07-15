import express from "express";
import {
  addKeyword,
  getKeywords,
  getKeyword,
  refreshKeyword,
  deleteKeyword,
  toggleTracking,
} from "../controllers/rankController.js";
import auth from "../middleware/auth.js";

const rankRouter = express.Router();

rankRouter.use(auth);

rankRouter.post("/add", addKeyword);
rankRouter.get("/list", getKeywords);
rankRouter.get("/:id", getKeyword);
rankRouter.post("/:id/refresh", refreshKeyword);
rankRouter.delete("/:id", deleteKeyword);
rankRouter.put("/:id/toggle", toggleTracking);

export default rankRouter;
