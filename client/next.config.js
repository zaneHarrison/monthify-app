/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = () => {
  const rewrites = () => {
    return [
      {
        source: "/api",
        destination: "http://localhost:5001/api",
      },
      {
        source: "/login",
        destination: "http://localhost:5001/login",
      },
      {
        source: "/callback",
        destination: "http://localhost:5001/callback",
      },
    ];
  };
  return {
    rewrites,
  };
};
