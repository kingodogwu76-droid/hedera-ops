import { NextResponse } from "next/server";
import {
  Client,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { logs, LogEntry } from "@/lib/logStore";

export async function POST(req: Request) {
  try {
    const { batchId, step, location, coords } = await req.json();

    const client =
      process.env.HEDERA_NETWORK === "testnet"
        ? Client.forTestnet()
        : Client.forMainnet();

    client.setOperator(
      process.env.HEDERA_ACCOUNT_ID!,
      process.env.HEDERA_PRIVATE_KEY!
    );

    const topicId = process.env.HEDERA_TOPIC_ID!;

    const newLog: LogEntry = {
      batchId,
      step,
      location,
      coords,
      timestamp: new Date().toISOString(),
    };

    // Save in memory
    logs.push(newLog);

    // Also submit to Hedera
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(newLog))
      .execute(client);

    const receipt = await tx.getReceipt(client);

    return NextResponse.json({
      success: true,
      status: receipt.status.toString(),
      log: newLog,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}