import express from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/types";
import jwt from "jsonwebtoken";
import { compareHash, createHash } from "./bcrypt";
import { middleware } from "./middleware";
import { prismaClient as prisma } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({ message: "incorrect inputs" });
    return;
  }

  try {
    const hashedPassword = await createHash(parsedData.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsedData.data.username,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });

    res.json({ userId: user.id });
  } catch (e) {
    console.log(e);
    res.status(411).json({
      message: "User already exists with this username",
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({ message: "incorrect inputs" });
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: parsedData.data.username,
    },
  });

  if (!user) {
    res.status(403).json({
      message: "Not authorized",
    });
    return;
  }

  const hashMatch = await compareHash(parsedData.data.password, user.password);

  if (!hashMatch) {
    res.status(403).json({
      message: "Not authorized",
    });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  res.json({ token, JWT_SECRET });
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({ message: "incorrect inputs" });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.json({ message: "not authorised" });
    return;
  }

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
      where: {
        roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 1000,
    });

    res.json({ messages });
  } catch (e) {
    console.log(e);
    res.json({
      messages: [],
    });
  }
});

app.get("/room/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({
      where: { slug },
    });

    res.json({ room });
  } catch (e) {
    res.status(401).json({
      messages: "Error",
    });
  }
});

app.listen("3001", () => {
  console.log("http server started on PORT: 3001");
});
