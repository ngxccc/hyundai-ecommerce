import { generatePayOSSignature } from "@nhatnang/shared/lib/payos";
import { db } from "../src/client";
import { paymentTransactions } from "../src/schemas";
import { eq } from "drizzle-orm";

// Usage: doppler run -- bun packages/database/scripts/mock-payos-payment.ts <orderCodeOrPrefix> [amount]
async function main() {
  const args = process.argv.slice(2);
  const inputCode = args[0];
  const amountStr = args[1];

  if (!inputCode) {
    console.error(
      "Usage: doppler run -- bun packages/database/scripts/mock-payos-payment.ts <orderCodeOrPrefix> [amount]",
    );
    process.exit(1);
  }

  console.log(
    `Connecting to database to resolve transaction for input: "${inputCode}"...`,
  );

  // Fetch pending transactions to find a match
  const pendingTx = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.status, "PENDING"));

  // Find by startsWith (handles truncated orderCode shown on PayOS sandbox UI) or exact match
  const matchedTx = pendingTx.find(
    (tx) =>
      String(tx.orderCode).startsWith(inputCode) ||
      tx.orderId.startsWith(inputCode),
  );

  if (!matchedTx) {
    console.error(
      `❌ Could not find any pending payment transaction starting with or matching "${inputCode}".`,
    );
    console.log("Active pending transactions:");
    pendingTx.forEach((tx) => {
      console.log(
        `- OrderCode: ${tx.orderCode} (Prefix: ${String(tx.orderCode).slice(0, 11)}), Amount: ${tx.amount}, OrderID: ${tx.orderId}`,
      );
    });
    process.exit(1);
  }

  const orderCode = matchedTx.orderCode;
  const amount = amountStr
    ? parseInt(amountStr, 10)
    : Math.round(parseFloat(matchedTx.amount));

  console.log(`Found matching transaction:`);
  console.log(`- Order ID:   ${matchedTx.orderId}`);
  console.log(`- Order Code: ${orderCode}`);
  console.log(`- Amount:     ${amount.toLocaleString("vi-VN")} VND`);

  const checksumKey = process.env["PAYOS_CHECKSUM_KEY"];
  if (!checksumKey) {
    console.error("PAYOS_CHECKSUM_KEY environment variable is not defined");
    process.exit(1);
  }

  const data = {
    orderCode,
    amount,
    description: `MOCK Payment for Order ${orderCode}`,
    reference: `MOCK-REF-${Date.now()}`,
  };

  // Generate signature using the shared library helper
  const signature = generatePayOSSignature(data, checksumKey);

  const payload = {
    code: "00",
    desc: "success",
    data,
    signature,
  };

  console.log(
    `Sending mock payment webhook for Order ${orderCode} with amount ${amount}...`,
  );
  try {
    const res = await fetch(
      "http://localhost:3000/api/payments/payos-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = (await res.json()) as { success: boolean; message: string };
    console.log("Response status:", res.status);
    console.log("Response body:", result);
  } catch (error) {
    console.error("Failed to send webhook:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Unhandled error:", err);
    process.exit(1);
  });
