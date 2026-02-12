import "dotenv/config";
import express from "express";
import cors from "cors";

import { startKeymaster } from "./services/keymaster.js";
import { Keymaster } from "@yourself_id/siwys-api-js";
import { loadWallet, saveWallet, updateWallet } from "./services/wallet.js";
import { writeToDb } from "./services/db.js";

const app = express();
const port = 3001;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const LOGINS: Record<string, unknown> = {};

app.use(cors());
app.use(express.json());

app.post("/challenges", async (_, res) => {
  const challengeDTO = {
    callback: `${BACKEND_URL}/login`,
  };
  try {
    const challenge = await Keymaster.createChallenge(challengeDTO);
    res.json(challenge);
  } catch (err) {
    console.error("Exception generating challenge:", err);
    res.status(500);
  }
});

app.get("/check-auth", async (req, res) => {
  const challenge = req.query.challenge;
  if (challenge && typeof challenge === "string" && LOGINS[challenge]) {
    res.json({ ...LOGINS[challenge] });
  } else {
    res.status(404).send({ error: "Challenge: " + challenge + " not found" });
  }
});

app.get("/login", async (req, res) => {
  const challenge = req.query.challenge;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Callback</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          h1 { margin: 0 0 1rem 0; }
          p { margin: 0.5rem 0; }
          .challenge { 
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 5px;
            word-break: break-all;
            margin-top: 1rem;
            font-family: monospace;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Authentication Callback</h1>
          <p>This is the authentication callback endpoint.</p>
          ${challenge ? `<div class="challenge">Challenge: ${challenge}</div>` : ""}
          <p style="margin-top: 1rem; font-size: 0.9rem;">You can close this window and return to the app.</p>
        </div>
      </body>
    </html>
  `);
});

app.post("/login", async (req, res) => {
  try {
    const { response } = req.body;
    const verify = await Keymaster.verifyResponse(response);
    if (verify.match) {
      console.log("Authentication successful!");
      if (verify.responder) {
        writeToDb(verify.responder);
      }
      LOGINS[verify.challenge] = { response, ...verify };
      res.json({ authenticated: verify.match });
    } else {
      res.status(401).send({ error: "Response: " + response + " not found" });
    }
  } catch (err) {
    console.error("Exception verifying response:", err);
    res.status(500).send();
  }
});

app.listen(port, () => {
  startKeymaster({
    gatekeeperConfig: {
      url: process.env.GATEKEEPER_URL || "http://localhost:4422",
    },
    walletConfig: {
      id: "demo-wallet",
      registry: "hyperswarm",
    },
    walletDb: {
      saveWallet: saveWallet,
      loadWallet: loadWallet,
      updateWallet: updateWallet,
    },
    passphrase: "demo-passphrase",
  });
});
