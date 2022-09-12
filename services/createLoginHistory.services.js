const { parseIp } = require('../utils/ip');
const axios = require('axios');
const LoginInfo = require('../models/login-info.model');
require('dotenv').config();

function checkIfValidIP(str) {
  // Regular expression to check if string is a IP address
  const regexExp =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;

  return regexExp.test(str);
}

const createLoginHistory = async (req, user) => {
  try {
    const ip = parseIp(req);
    const isValidIp = checkIfValidIP(ip);

    if (!isValidIp) return false;

    const { data: ipData } = await axios.get(
      `https://api.ipdata.co/${ip}/?api-key=${process.env.IPDATA_API_KEY}`
    );

    if (ipData) {
      const loginInfo = new LoginInfo({
        _user: user._id,
        ...ipData,
      });

      if (!user.loginHistory) {
        user.loginHistory = [loginInfo];
      } else {
        user.loginHistory.push(loginInfo);
      }

      await loginInfo.save();

      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

module.exports = {
  createLoginHistory,
};
