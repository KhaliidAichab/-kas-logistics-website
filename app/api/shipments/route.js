import { NextResponse } from "next/server";
import { NextResponse } from "next/server";
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/shipments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          shipment_id: body.shipment_id || null,
          customer: body.customer || "",
          origin: body.origin || "",
          destination: body.destination || "",
          service: body.mode || "Air",
          cargo_type: body.cargo_type || null,
          weight: body.weight || null,
          quantity: body.quantity || null,
          pickup_date: body.pickup_date || null,
          eta: body.eta || null,
          special_requirements: body.special_requirements || null,
          status: "Created",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, shipment: data[0] },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
