import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import standingsRoutes from "./routes/standingsRoutes.js";
import adminStandingsRoutes from "./routes/adminStandingsRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import pickemRoutes from "./routes/pickemRoutes.js";
import adminScheduleRoutes from "./routes/adminScheduleRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "KovacsFantasy backend OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/standings", standingsRoutes);
app.use("/api/admin", adminStandingsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/pickem", pickemRoutes);
app.use("/api/admin", adminScheduleRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});