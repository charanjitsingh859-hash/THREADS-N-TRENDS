const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "gen-lang-client-0171731438",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8085
    }
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("unauthenticated read fails on customer_orders", async () => {
  const unauthedDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthedDb.collection("customer_orders").get());
});

test("authenticated user can read and write customer_orders", async () => {
  const authedDb = testEnv.authenticatedContext("user123").firestore();
  const docRef = authedDb.collection("customer_orders").doc("order_test");
  await assertSucceeds(docRef.set({
    customerName: "Simran Kaur",
    phoneNumber: "+91 98765 43210",
    workDetails: "Punjabi Suit",
    totalAmount: 4500,
    advancePaid: 2000,
    balanceDue: 2500,
    orderStatus: "In Progress"
  }));
  await assertSucceeds(docRef.get());
});
