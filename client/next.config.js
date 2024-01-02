/** @type {import('next').NextConfig} */
const nextConfig = {};

require("dotenv").config({ path: "../config.env" });
const SERVER_BASE_URL = process.env.SERVER_BASE_URL;

module.exports = () => {
  const rewrites = () => {
    return [
      {
        source: "/login",
        destination: `${SERVER_BASE_URL}/login`,
      },
      {
        source: "/callback",
        destination: `${SERVER_BASE_URL}/callback`,
      },
      {
        source: "/refresh_token",
        destination: `${SERVER_BASE_URL}/refresh_token`,
      },
    ];
  };
  return {
    rewrites,
  };
};
