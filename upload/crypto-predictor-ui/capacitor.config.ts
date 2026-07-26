import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.cryptopredictor.app",
  appName: "PredicTX",
  // Next.js static export output directory
  webDir: "out",
  backgroundColor: "#05080c",
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#05080c",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#05080c",
    },
  },
}

export default config
