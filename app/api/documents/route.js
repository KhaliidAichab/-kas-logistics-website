
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE = { "Cache-Control": "no-store" };

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");
}

async function authorizeRequest(request) {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const token = (
    request.headers.get("authorization") || ""
  ).match(/^Bearer\s+(.+)$/i)?.[1];

  if (!supabaseUrl || !publishableKey) {
    return { error: "configuration" };
  }

  if (!token) {
    return { error: "unauthorized" };
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/user`,
    {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { error: "unauthorized" };
  }

  const user = await response.json();

  return user?.id
    ? { user }
    : { error: "unauthorized" };
}

function getRestConfig() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY;

  return url && key ? { url, key } : null;
}

function errorResponse(message, status) {
  return NextResponse.json(
    { success: false, error: message },
    { status, headers: NO_CACHE }
  );
}

export async function GET(request) {
  try {
    const auth = await authorizeRequest(request);

    if (auth.error === "configuration") {
      return errorResponse(
        "Supabase authentication is not configured.",
        500
      );
    }

    if (auth.error) {
      return errorResponse("Authentication required.", 401);
    }

    const config = getRestConfig();

    if (!config) {
      return errorResponse(
        "Document database access is not configured.",
        500
      );
    }

    const response = await fetch(
      `${config.url}/rest/v1/documents?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return errorResponse("Unable to load documents.", 502);
    }

    return NextResponse.json(
      { success: true, documents: data },
      { headers: NO_CACHE }
    );
  } catch {
    return errorResponse("Unable to load documents.", 500);
  }
}

export async function POST(request) {
  try {
    const auth = await authorizeRequest(request);

    if (auth.error === "configuration") {
      return errorResponse(
        "Supabase authentication is not configured.",
        500
      );
    }

    if (auth.error) {
      return errorResponse("Authentication required.", 401);
    }

    const config = getRestConfig();

    if (!config) {
      return errorResponse(
        "Document database access is not configured.",
        500
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return errorResponse("Invalid request body.", 400);
    }

    const text = (value) =>
      typeof value === "string" ? value.trim() : "";

    const documentNumber = text(body.document_number);
    const customerName = text(body.customer_name);
    const documentType = text(body.document_type);

    if (!documentNumber || !customerName || !documentType) {
      return errorResponse(
        "Document number, customer and document type are required.",
        400
      );
    }

    const allowedStatuses = new Set([
      "Pending",
      "Received",
      "Under Review",
      "Approved",
      "Rejected",
      "Expired",
    ]);

    const status = text(body.status) || "Pending";

    if (!allowedStatuses.has(status)) {
      return errorResponse("Invalid document status.", 400);
    }

    const record = {
      document_number: documentNumber,
      shipment_id: text(body.shipment_id) || null,
      customer_name: customerName,
      document_type: documentType,
      file_name: text(body.file_name) || null,
      file_url: text(body.file_url) || null,
      status,
      issue_date: text(body.issue_date) || null,
      expiry_date: text(body.expiry_date) || null,
      notes: text(body.notes) || null,
    };

    const response = await fetch(
      `${config.url}/rest/v1/documents`,
      {
        method: "POST",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(record),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return errorResponse(
        "Unable to create document. Check the submitted fields.",
        400
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: Array.isArray(data) ? data[0] : data,
      },
      { status: 201, headers: NO_CACHE }
    );
  } catch {
    return errorResponse("Unable to create document.", 500);
  }
}

