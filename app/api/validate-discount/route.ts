// app/api/validate-discount/route.ts
import { dodopayments } from "@/utils/dodopayment";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { discountCode } = await req.json();
  if (!discountCode) {
    return NextResponse.json(
      { valid: false, error: "No code provided" },
      { status: 400 }
    );
  }

  // 1. List Discounts (GET /discounts) to find its internal ID :contentReference[oaicite:2]{index=2}
  const listIter = dodopayments.discounts.list({ page_size: 100 });
  let match: any = null;
  for await (const d of listIter) {
    if (d.code.toLowerCase() === discountCode.toLowerCase()) {
      match = d;
      break;
    }
  }
  if (!match) {
    return NextResponse.json(
      { valid: false, error: "Invalid discount code" },
      { status: 404 }
    );
  }

  // 2. Validate Discount (GET /discounts/{discount_id}) :contentReference[oaicite:3]{index=3}
  const discount = await dodopayments.discounts.retrieve(match.discount_id);

  // 3. Check expiry & usage
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json(
      { valid: false, error: "Code expired" },
      { status: 400 }
    );
  }
  if (
    discount.usage_limit !== undefined &&
    discount.usage_limit !== null &&
    discount.times_used >= discount.usage_limit
  ) {
    return NextResponse.json(
      { valid: false, error: "Usage limit reached" },
      { status: 400 }
    );
  }

  return NextResponse.json({ valid: true });
}
