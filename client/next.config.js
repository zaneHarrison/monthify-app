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
        source: "/opt-out",
        destination: `${SERVER_BASE_URL}/opt-out`,
      },
    ];
  };
  return {
    rewrites,
  };
};
