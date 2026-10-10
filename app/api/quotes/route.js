
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();

    const requiredFields = [
      "cargoType",
      "company",
      "phone",
    ];

    for (const field of requiredFields) {
      if (
        !body[field] ||
        String(body[field]).trim() === ""
      ) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const secretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/quotes`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          cargo_type: body.cargoType,
          company: body.company,
          phone: body.phone,
          pickup_date: body.pickupDate || null,
        }),
        cache: "no-store",
      }
    );

const result = await response.json();

if (!response.ok) {
  console.error("Supabase quote insert failed:", result);

  return NextResponse.json(
    { success: false, error: result },
    { status: response.status }
  );
}

if (!Array.isArray(result) || result.length === 0) {
  console.error("Supabase returned no inserted quote:", result);

  return NextResponse.json(
    { success: false, error: "No quote record returned" },
    { status: 500 }
  );
}

return NextResponse.json(
  {
    success: true,
    quote: result[0],
  },
  { status: 201 }
);

  } catch (error) {
    return NextResponse.json(
      { error: "Unable to process quote request" },
      { status: 500 }
    );
  }
}

