import express from "express";
import cors from "cors";

import { getKeymaster, startKeymaster } from "./services/keymaster";
import { loadWallet, saveWallet } from "./services/wallet";
import { writeToDb } from "./services/db";

const app = express();
const port = 3001;

let LOGINS = [];

app.use(cors());
app.use(express.json());

app.post("/challenges", async (_, res) => {
  const keymaster = getKeymaster();
  const callbackUrl = "http://localhost:3001/login";
  try {
    const challenge = await keymaster.createChallenge({
      callback: callbackUrl,
    });
    res.json(challenge);
  } catch (err) {
    console.error("Exception generating challenge:", err);
    res.status(500);
  }
});

app.get("/check-auth", async (req, res) => {
  const challenge = req.query.challenge;
  if (challenge && typeof challenge === "string" && LOGINS[challenge]) {
    res.json(LOGINS[challenge]);
  } else {
    res.status(204).send();
  }
});

app.post("/login", async (req, res) => {
  const keymaster = getKeymaster();
  try {
    const { response } = req.body;
    const verify = await keymaster.verifyResponse(response);
    if (verify.match) {
      console.log("Authentication successful!");
      writeToDb(verify.responder);
      LOGINS[verify.challenge] = { response, ...verify };
      res.json({ authenticated: verify.match });
    } else {
      res.send(401);
    }
  } catch (err) {
    console.error("Exception verifying response:", err);
    res.status(500);
  }
});

app.listen(port, () => {
  startKeymaster({
    gatekeeperConfig: {
      url: "http://gatekeeper:4224",
    },
    onSaveWallet: saveWallet,
    onLoadWallet: loadWallet,
  });
});
