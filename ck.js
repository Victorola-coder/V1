export default {
  get: function (name) {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split("=");
      if (cookie[0] === name) {
        return cookie[1];
      }
    }
    return null;
  },
  set: function (name, value, expires) {
    let cookie = `${name}=${value};`;
    if (expires) {
      cookie += `expires=${expires.toUTCString()};`;
    } else {
      const today = new Date();
      expires = new Date(today.setMonth(today.getMonth() + 3));
      cookie += `expires=${expires.toUTCString()};path=/`;
    }
    document.cookie = cookie;
    return this.get(name);
  },
  delete: function (name) {
    const expires = new Date();
    expires.setTime(expires.getTime() - 1);
    document.cookie = `${name}=; expires=${expires.toUTCString()};`;
  },
  deleteAll: function () {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=${location.hostname};path=/`;
    }
  },
};
