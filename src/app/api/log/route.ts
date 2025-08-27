import { NextResponse } from "next/server";
import {
  Client,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

export async function POST(req: Request) {
  try {
    const { batchId, role, event, location, notes } = await req.json();

    const client =
      process.env.HEDERA_NETWORK === "testnet"
        ? Client.forTestnet()
        : Client.forMainnet();

    client.setOperator(
      process.env.HEDERA_ACCOUNT_ID!,
      process.env.HEDERA_PRIVATE_KEY!
    );

    const topicId = process.env.HEDERA_TOPIC_ID!;

    // Create message payload
    const message = JSON.stringify({
  batchId,
  step: event,   // normalize so history always reads `step`
  role,
  location,
  notes,
  timestamp: new Date().toISOString(),
});


    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);

    const receipt = await tx.getReceipt(client);

    return NextResponse.json({
      success: true,
      status: receipt.status.toString(),
      message,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}