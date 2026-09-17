import type { Request, Response } from "express";

export const getProviders = (_req: Request, res: Response) => {
  res.json({
    providers: [
      { id: "email", name: "Email/Password" },
      { id: "google", name: "Google" },
      { id: "apple", name: "Apple" },
    ],
  });
};
