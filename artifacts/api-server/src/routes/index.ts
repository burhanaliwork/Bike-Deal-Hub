import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bikesRouter from "./bikes";
import storageRouter from "./storage";
import authRouter from "./auth";
import showroomsRouter from "./showrooms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(showroomsRouter);
router.use(bikesRouter);
router.use(storageRouter);

export default router;
