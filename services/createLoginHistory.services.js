// const { parseIp } = require('../utils/ip');
// const axios = require('axios');
// const LoginInfo = require('../models/login-info.model');
require('dotenv').config();

const createLoginHistory = async (req, user) => {
  try {
    return true;
    // const ip = parseIp(req);

    // const { data: ipData } = await axios.get(
    //   `https://api.ipdata.co/${ip}/?api-key=${process.env.IPDATA_API_KEY}`
    // );

    // if (ipData) {
    //   const loginInfo = new LoginInfo({
    //     _user: user._id,
    //     ...ipData,
    //   });

    //   if (!user.loginHistory) {
    //     user.loginHistory = [loginInfo];
    //   } else {
    //     user.loginHistory.push(loginInfo);
    //   }

    //   await loginInfo.save();

    //   return true;
    // }

    // return false;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createLoginHistory,
};
