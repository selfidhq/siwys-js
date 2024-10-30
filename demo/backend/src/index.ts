import express from "express";

import { getKeymaster, startKeymaster } from "./services/keymaster";
import { loadWallet, saveWallet } from "./services/wallet";
import { writeToDb } from "./services/db";

const app = express();
const port = 3001;

let LOGINS = [];

async function handleCreateChallenge(res) {
  const keymaster = getKeymaster();
  try {
    const response = await keymaster.createChallenge({
      callbackUrl: "http://localhost:30001/login",
    });
    console.log(`Response`, response);
    res.send(response);
  } catch (err) {
    console.error("Exception generating challenge:", err);
    res.status(500);
  }
}

// TODO: remove this endpoint once demo app is fleshed out
app.get("/challenges", async (_, res) => {
  handleCreateChallenge(res);
});

app.post("/challenges", async (_, res) => {
  handleCreateChallenge(res);
});

app.post("/login", async (req, res) => {
  const keymaster = getKeymaster();
  try {
    const { response } = req.body;
    const verify = await keymaster.verifyResponse(response);

    if (verify.match) {
      writeToDb(verify.responder);
      LOGINS[verify.challenge] = { response, ...verify };
      //req.session.user = LOGINS[verify.challenge];
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
      url: "http://localhost:4224",
    },
    onSaveWallet: saveWallet,
    onLoadWallet: loadWallet,
  });
});
