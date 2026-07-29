import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const bodyString =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET as string
      )
      .update(bodyString.toString())
      .digest("hex");

    const isValid =
      expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Payment",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment Verified",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Verification Failed",
      },
      { status: 500 }
    );
  }
}