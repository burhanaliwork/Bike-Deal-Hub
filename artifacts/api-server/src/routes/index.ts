import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bikesRouter from "./bikes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bikesRouter);

export default router;
