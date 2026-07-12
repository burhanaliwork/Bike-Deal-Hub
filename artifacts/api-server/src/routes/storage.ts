import { Router, type IRouter, type Request, type Response } from "express";
import { createHmac, randomUUID } from "crypto";

const router: IRouter = Router();

/**
 * GET /imagekit/auth
 *
 * Returns ImageKit upload authentication parameters.
 * The frontend uses these to upload directly to ImageKit CDN.
 */
router.get("/imagekit/auth", (req: Request, res: Response) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    res.status(500).json({ error: "ImageKit is not configured on the server." });
    return;
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  res.json({
    token,
    expire,
    signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? "",
  });
});

export default router;
