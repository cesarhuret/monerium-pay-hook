export const getAccessTokenExtended = async (
  client,
  code,
  setAuthCTX,
  setProfileId,
  setAccounts,
  setRecipient,
  router,
  setTransactions,
  setAccessToken,
  setRefreshToken,
  getOrders
) => {
  const authCtx = await getAccessToken(
    client,
    code,
    window.location.origin + window.location.pathname
  );
  setAuthCTX(authCtx);

  const { id, accounts } = await client.getProfile(authCtx.profiles[0].id);

  let filteredAccounts = {};

  for (const account of accounts) {
    const { address } = account;

    if (!filteredAccounts[address]) {
      filteredAccounts[address] = [];
    }

    filteredAccounts[address].push(account);
  }

  setProfileId(id);
  setAccounts(filteredAccounts);
  setRecipient(
    Object.keys(filteredAccounts)[Object.keys(filteredAccounts).length - 1]
  );

  // Your access and refresh tokens are now available.
  const { access_token, refresh_token } = client.bearerProfile;

  localStorage.setItem("profileId", id);
  localStorage.setItem("accessToken", access_token);
  localStorage.setItem("refreshToken", refresh_token);

  setAccessToken(access_token);
  setRefreshToken(refresh_token);

  setTransactions(await getOrders());

  router.replace("/", undefined, { shallow: true });
};

export const getAccessToken = async (client, code, uri) => {
  const authCode = new URLSearchParams(window.location.search).get("code");

  // Retrieve the stored code verifier.
  const retrievedCodeVerifier = window.localStorage.getItem("myCodeVerifier");

  // Finalize the authentication process.
  await client.auth({
    client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your client ID
    code: authCode,
    code_verifier: retrievedCodeVerifier,
    redirect_uri: uri, // ensure this matches the redirect_uri used initially
  });

  // Confirm the user is authenticated and retrieve the authentication data.
  const authCtx = await client.getAuthContext();

  localStorage.setItem("profileId", authCtx.profiles[0].id);

  return authCtx;
};
