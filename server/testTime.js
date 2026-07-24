import dotenv from "dotenv";
dotenv.config();

const { keywordTracking } = await import("./services/keywordTrackingService.js");

async function test() {
  const dummyTracking = {
    keyword: "some random string that will not be found 123984712984",
    domain: "nonexistentdomain.com",
    currentPosition: null,
    bestPosition: null,
    rankHistory: [],
    save: async function() { console.log("Mock save called"); }
  };
  
  console.log("Starting keywordTracking test...");
  const start = Date.now();
  const res = await keywordTracking(dummyTracking);
  console.log("Time taken:", (Date.now() - start) / 1000, "seconds");
  console.log("Tracking result:", JSON.stringify(res, null, 2));
}

test().catch(console.error);
