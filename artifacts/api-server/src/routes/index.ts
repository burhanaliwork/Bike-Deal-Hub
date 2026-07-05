import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bikesRouter from "./bikes";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bikesRouter);
router.use(storageRouter);

export default router;
