import express from "express";
import cors from "cors";
import authRoute from "./route/auth.route.js";
import managerRoute from "./route/manager.route.js";
import checkerRoute from "./route/checker.route.js";
import userRoute from "./route/user.route.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use("/api/auth", authRoute);
app.use("/api/server", managerRoute);
app.use("/api/checker", checkerRoute);
app.use("/api/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
