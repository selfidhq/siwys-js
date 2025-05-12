import express from "express";
import cors from "cors";

import { startKeymaster } from "./services/keymaster";
import { Keymaster } from "@yourself_id/siwys-api-js";
import { loadWallet, saveWallet } from "./services/wallet";
import { writeToDb } from "./services/db";

const app = express();
const port = 3001;

let LOGINS = [];

app.use(cors());
app.use(express.json());

app.post("/challenges", async (_, res) => {
  const challengeDTO = {
    callback: "http://localhost:3001/login",
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
      url: "https://gatekeeper.selfid.com",
    },
    walletConfig: {
      id: "demo-wallet",
    },
    walletDb: {
      saveWallet: saveWallet,
      loadWallet: loadWallet,
    },
  });
});
