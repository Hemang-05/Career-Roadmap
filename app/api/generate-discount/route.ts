// app/api/generate-discount/route.ts
import { NextResponse } from "next/server";
import { dodopayments } from "@/utils/dodopayment";
import { createClient } from "@supabase/supabase-js";

// Server‑only Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { error: "Missing `email` query param" },
      { status: 400 }
    );
  }

  // 1) Fetch our stored record (including discount_id)
  const { data: existing, error: fetchErr } = await supabase
    .from("user_discounts")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (fetchErr) {
    console.error("GET supabase error:", fetchErr);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return new NextResponse(null, { status: 204 });
  }

  console.log(
    `🔍 Syncing discount for ${email}, current times_used: ${existing.times_used}`
  );

  // 2) Try retrieving live data using discount_id (much more efficient)
  let liveTimesUsed = existing.times_used;

  if (existing.discount_id) {
    // Use the efficient retrieve method with discount_id
    try {
      console.log(`🔍 Retrieving discount by ID: ${existing.discount_id}`);
      const live = await dodopayments.discounts.retrieve(existing.discount_id);

      console.log(`✅ Found discount:`, {
        code: live.code,
        times_used: live.times_used,
        discount_id: live.discount_id,
      });

      if (typeof live.times_used === "number") {
        liveTimesUsed = live.times_used;
      }
    } catch (err) {
      console.warn(
        `⚠️ Failed to retrieve discount by ID ${existing.discount_id}, falling back to search:`,
        err
      );

      // Fallback: search by code if direct retrieval fails
      try {
        console.log(`🔍 Searching for discount code: ${existing.coupon_code}`);

        for await (const page of dodopayments.discounts.list({
          page_size: 100,
        })) {
          let discounts: any[] = [];

          if (Array.isArray(page)) {
            discounts = page;
          } else if (page && typeof page === "object") {
            discounts =
              (page as any).data ||
              (page as any).items ||
              (page as any).results ||
              [];
          }

          if (Array.isArray(discounts)) {
            const foundDiscount = discounts.find(
              (discount: any) => discount.code === existing.coupon_code
            );
            if (foundDiscount) {
              console.log(`✅ Found discount by code:`, {
                code: foundDiscount.code,
                times_used: foundDiscount.times_used,
                discount_id: foundDiscount.discount_id,
              });

              if (typeof foundDiscount.times_used === "number") {
                liveTimesUsed = foundDiscount.times_used;
              }

              // Update the stored discount_id for future efficiency
              if (foundDiscount.discount_id !== existing.discount_id) {
                console.log(
                  `🔄 Updating stored discount_id to ${foundDiscount.discount_id}`
                );
                await supabase
                  .from("user_discounts")
                  .update({ discount_id: foundDiscount.discount_id })
                  .eq("email", email);
              }
              break;
            }
          }
        }
      } catch (listErr) {
        console.error("Fallback search also failed:", listErr);
      }
    }
  } else {
    console.warn(`⚠️ No discount_id stored for ${email}, using search method`);

    // Legacy support: search by code if no discount_id is stored
    try {
      console.log(`🔍 Searching for discount code: ${existing.coupon_code}`);

      for await (const page of dodopayments.discounts.list({
        page_size: 100,
      })) {
        let discounts: any[] = [];

        if (Array.isArray(page)) {
          discounts = page;
        } else if (page && typeof page === "object") {
          discounts =
            (page as any).data ||
            (page as any).items ||
            (page as any).results ||
            [];
        }

        if (Array.isArray(discounts)) {
          const foundDiscount = discounts.find(
            (discount: any) => discount.code === existing.coupon_code
          );
          if (foundDiscount) {
            console.log(`✅ Found discount by code:`, {
              code: foundDiscount.code,
              times_used: foundDiscount.times_used,
              discount_id: foundDiscount.discount_id,
            });

            if (typeof foundDiscount.times_used === "number") {
              liveTimesUsed = foundDiscount.times_used;
            }

            // Store the discount_id for future efficiency
            console.log(
              `🔄 Storing discount_id ${foundDiscount.discount_id} for future use`
            );
            await supabase
              .from("user_discounts")
              .update({ discount_id: foundDiscount.discount_id })
              .eq("email", email);
            break;
          }
        }
      }
    } catch (err) {
      console.error("Failed to search for discount:", err);
    }
  }

  // 3) If it changed, update Supabase
  if (liveTimesUsed !== existing.times_used) {
    console.log(
      `🔄 Updating times_used from ${existing.times_used} to ${liveTimesUsed}`
    );

    const { error: updateErr } = await supabase
      .from("user_discounts")
      .update({ times_used: liveTimesUsed })
      .eq("email", email);

    if (updateErr) {
      console.error("Failed to update Supabase:", updateErr);
    } else {
      console.log("✅ Successfully updated Supabase");
    }
  } else {
    console.log(`✅ No update needed, times_used is already ${liveTimesUsed}`);
  }

  return NextResponse.json({
    code: existing.coupon_code,
    expires_at: existing.expires_at,
    usage_limit: existing.usage_limit,
    times_used: liveTimesUsed,
  });
}

export async function POST(request: Request) {
  console.log("🔥 POST /api/generate-discount", new Date().toISOString());

  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json(
        { error: "Missing `email` in request body" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1) Look for existing, still‑valid coupon
    const { data: existing, error: fetchErr } = await supabase
      .from("user_discounts")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (
      existing &&
      existing.times_used < existing.usage_limit &&
      existing.expires_at > now
    ) {
      console.log(`♻️ Returning existing valid coupon for ${email}`);
      return NextResponse.json(
        {
          code: existing.coupon_code,
          expires_at: existing.expires_at,
          usage_limit: existing.usage_limit,
          times_used: existing.times_used,
        },
        { status: 200 }
      );
    }

    // 2) Otherwise, create a new coupon
    console.log(`🆕 Creating new discount for ${email}`);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const discount = await dodopayments.discounts.create({
      amount: 1000, // 10% in basis points
      type: "percentage" as const,
      usage_limit: 3,
      expires_at: expiresAt.toISOString(),
    });

    console.log(`✅ Created discount:`, {
      code: discount.code,
      discount_id: discount.discount_id,
      times_used: discount.times_used,
    });

    // 3) Upsert on the email primary key - store discount_id for future reference
    const { error: upsertErr } = await supabase.from("user_discounts").upsert(
      {
        email,
        coupon_code: discount.code,
        discount_id: discount.discount_id, // Store this for future API calls
        expires_at: discount.expires_at,
        usage_limit: discount.usage_limit || 3,
        times_used: discount.times_used || 0,
        refund_active: null,
      },
      { onConflict: ["email"] }
    );
    if (upsertErr) throw upsertErr;

    return NextResponse.json(
      {
        code: discount.code,
        expires_at: discount.expires_at,
        usage_limit: discount.usage_limit || 3,
        times_used: discount.times_used || 0,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("generate-discount POST error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
