import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import quizzesRouter from "./quizzes";
import candidatesRouter from "./candidates";
import attemptsRouter from "./attempts";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(quizzesRouter);
router.use(candidatesRouter);
router.use(attemptsRouter);
router.use(analyticsRouter);

export default router;
