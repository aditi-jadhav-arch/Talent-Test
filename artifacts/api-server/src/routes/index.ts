import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quizzesRouter from "./quizzes";
import candidatesRouter from "./candidates";
import attemptsRouter from "./attempts";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quizzesRouter);
router.use(candidatesRouter);
router.use(attemptsRouter);
router.use(analyticsRouter);

export default router;
