import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

if (!process.env.NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is not set");
}

const config = new Configuration({ apiKey: "E70C6448-79AF-43BE-A5EE-095FCC8BC365" });

console.log(config);
const neynarClient = new NeynarAPIClient(config);

export default neynarClient;
