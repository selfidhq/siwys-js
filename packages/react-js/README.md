# Sign in with your SELF React SDK

Sign in with your SELF (SIWYS) is a SELF product that allows users to authenticate with partner apps/dapps using their own private keys and credentials and the MDIP protocol.

This SDK is designed to offer reusable React components to help facilitate the user-facing authentication workflow.

Please refer to the partner integration guide for more information regarding SIWYS.

# Install

```
npm install @yourself_id/siwys-react-js
```
or
```
yarn add @yourself_id/siwys-react-js
```

# Render SIWYS Button

```js
<SiwysButton
  onClick={() => {
    // navigate to dedicated SIWYS page
  }}
  colorTheme="dark"
  glow
/>
```

The following are the acceptable props for the `SiwysButton` component:

|Parameter|Type|Description|Required|Default|
|--|-|-|-|-|
|onClick|func|Function to execute.<br/>This should redirect to a dedicated page that renders the `SignInWithYourSelf` Component (below) |Yes||
|colorTheme|string|Color theme of button. <br/>Either "light" or "dark"|No|Auto-detect from system|
|glow|boolean|Whether to show glow hover effect|No|false|

# Render SIWYS Component

The SIWYS component includes the QR code for scanning as well as additional information to inform users on how to take action. Consequently, this component should ideally be rendered on its own dedicated page to avoid any formatting/styling issues.

```js
<SignInWithYourSelf
  createChallengeUrl="https://your-sever-url/challenges"
  pollForChallengeComplete="https://your-server-url/auth"
  pollingIntervalSec={5}
  onChallengeComplete={(resp) => console.log("Auth Respone:", resp)}
/>
```

The following are the acceptable props for the `SignInWithYourSelf` component:

|Parameter|Type|Description|Required|Default|
|--|-|-|-|-|
|createChallengeUrl|func|URL for creating the Challenge.<br/>This should be the endpoint you created when setting up the SIWYS API SDK.|Yes||
|pollForChallengeComplete|string|URL polling for challenge completion status.<br/>This should be the endpoint you created when setting up the SIWYS API SDK.|No|The component will not poll for challenge completion.|
|pollingIntervalSec|boolean|How often to poll for Challenge completion.|No|5|
|onChallengeComplete|boolean|Callback for handling a completed Challenge.<br/>Will pass back the result of the polling endpoint.<br/>Required when `pollForAuthUrl` is supplied.|No|N/A|

> [!IMPORTANT]
> If you do not provide the `pollForAuthUrl` you must implement your own logic of informing the Client when the challenge has been completed.
> For more information see the setup guide for the SIWYS API SDK.

# Complete Example

The following is a complete, minimal example using Next.js and assuming that the `pollForChallengeCompleteUrl` sets the appropriate authentication mechansim, eg a JWT cookie.

```js
// index.tsx entrypoint
import React, { render, useEffect, useState } from "react"

import { useRouter } from 'next/router';

import { SiwysButton } from "@yourself_id/react-js";

const App: React.FC<{}> = () => {
  const [user, setUser] = useState();
  
  const router = useRouter();

  useEffect(() => {
    // fetch user info if authenticated
    fetch("/me").then(setUser)
  }, [])

  return (
    <div>
      {user && <Homepage />}
      {!user && (
        <SiwysButton
          colorTheme="dark"
          glow
          onClick={() => router.push("/login")}
        />
      )}
    </div>
  );
};

export default App;

render(<App />, document.getElementById('app')!)

// pages/login/index.tsx
import React, { render, useState } from "react"

import { SignInWithYourSelf } from "@yourself_id/react-js";

const Login: React.FC<{}> = () => {
  const router = useRouter();

  return (
    <SignInWithYourSelf
      createChallengeUrl="https://your-server-url/challenges"
      pollForChallengeCompleteUrl="https://your-server-url/auth"
      onChallengeComplete={() => router.push("/")} 
    />
  );
};

export default Login;
```

Note: `onChallengeComplete` may have a Coo
