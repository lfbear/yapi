import React from 'react'

module.exports = function (options) {
  const handleLogin = () => {
    const { hostscheme, hostname, redirectUri, authPath, appId } = options;
    //let scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
    let scopes = ["email", "profile", "openid"]
    let ret = encodeURIComponent(redirectUri);
    let redirectURL = hostscheme + "://" + hostname + authPath + '?client_id='
      + appId + '&scope=' + encodeURIComponent(scopes.join(" ")) + '&response_type=code&state=yapi&redirect_uri=' + ret + '&access_type=offline';
    location.href = redirectURL;
  }

  const oAuthComponent = () => (
    <button onClick={handleLogin} className="btn-home btn-home-normal">Google登录</button>
  )

  this.bindHook('third_login', oAuthComponent);
};










