/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WALLETCONNECT_PROJECT_ID: '25d4850d096138308cf23a033382cdaf',
    OWNER_PRIVATE_KEY: 'b84d1d52f9bfb98efbfbdcfbd7851017349ca72c25df5f47639acd6d462d41d6'
  }
}

module.exports = nextConfig
