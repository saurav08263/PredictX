import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit is ₹100" },
        { status: 400 }
      );
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create Razorpay order",
      },
      { status: 500 }
    );
  }
}