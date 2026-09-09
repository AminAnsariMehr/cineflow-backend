import peopleRouter from "./routes/peopleRoutes.js";

export const peopleModule = (app) => {
  app.use("/api/people", peopleRouter);
};
