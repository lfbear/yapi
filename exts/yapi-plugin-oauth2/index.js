module.exports = {
  server: true,
  client: true,
  options: {
    "type": "oauth2",
    "hostscheme": "https",
    "hostname": "",
    "loginPath": "openidconnect.googleapis.com/v1/userinfo",
    "authPath": "accounts.google.com/o/oauth2/auth",
    "tokenPath": "oauth2.googleapis.com/token",
    "redirectUri": "https://api.mgmt.snappay.ca/api/plugin/oauth2/callback",
    "appId": "313060504898-vojnv5v0nilj6odu4jdtuj77hd921251.apps.googleusercontent.com",
    "appSecret": "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",
    "emailKey": "email",
    "userKey": "name",
    "emailPostfix": "@snaplii.com"
  }
}
