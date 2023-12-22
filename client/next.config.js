/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = () => {
  const rewrites = () => {
    return [
      {
        source: "/api",
        destination: "http://localhost:5001/api",
      },
    ];
  };
  return {
    rewrites,
  };
};
