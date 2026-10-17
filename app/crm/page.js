"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
function isOperationalException(shipment) {
  const status = String(shipment?.status || "")
    .trim()
    .toLowerCase();

  if (/delivered|cancelled|canceled/.test(status)) {
    return false;
  }

  if (
    /delayed|delay|at risk|overdue|exception|customs|clearance|hold|failed/.test(
      status
    )
  ) {
    return true;
  }

  const etaText = String(shipment?.eta || "").trim();

  if (
    !etaText ||
    etaText === "—" ||
    /\b(today|tomorrow|yesterday)\b/i.test(etaText) ||
    !/\b20\d{2}\b/.test(etaText)
  ) {
    return false;
  }

  const etaDate = new Date(etaText);

  if (Number.isNaN(etaDate.getTime())) {
    return false;
  }

  const hasTime = /(?:T|\s)\d{1,2}:\d{2}/i.test(etaText);

  if (hasTime) {
    return etaDate < new Date();
  }

  const etaDay = new Date(etaDate);
  etaDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return etaDay < today;
}
const shipments = [
  {
    id: "KAS-24081",
    customer: "ABC Trading",
    route: "Riyadh → Dubai",
    mode: "Air",
    eta: "Today, 18:40",
    status: "On Time",
  },
  {
    id: "KAS-24082",
    customer: "Gulf Industries",
    route: "Shanghai → Jeddah",
    mode: "Sea",
    eta: "14 Oct",
    status: "In Transit",
  },
  {
    id: "KAS-24083",
    customer: "Nile Retail",
    route: "Riyadh → Dammam",
    mode: "Land",
    eta: "Today, 15:20",
    status: "Delayed",
  },
  {
    id: "KAS-24084",
    customer: "MedCare Pharma",
    route: "Dubai → Riyadh",
    mode: "Air",
    eta: "09 Oct",
    status: "In Transit",
  },
];

const menuItems = [
  "Dashboard",
  "Customers",
  "Leads",
  "Quotes",
  "Bookings",
  "Shipments",
  "Control Tower",
  "Documents",
  "Finance",
  "Analytics",
];

export default function CRM() {
  const [active, setActive] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [liveQuotes, setLiveQuotes] = useState([]);
const [quotesLoading, setQuotesLoading] = useState(true);
const [quotesError, setQuotesError] = useState("");
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [liveShipments, setLiveShipments] = useState([]);
const [showAllShipments, setShowAllShipments] = useState(false);

const [customers, setCustomers] = useState([]);

useEffect(() => {
  async function loadCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("company_name, contact_name, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Customers loading error:", error.message);
      return;
    }

    setCustomers(
      (data || []).map((item) => ({
        company: item.company_name,
        contact: item.contact_name,
        shipments: 0,
        revenue: "—",
        status: item.status || "Active",
      }))
    );
  }

  loadCustomers();
}, []);

  useEffect(() => {
  async function loadShipments() {
    try {
      const response = await fetch("/api/shipments", {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.shipments) {
        const seenShipmentIds = new Set();

const deduplicatedShipments = [...result.shipments]
  .sort((a, b) => Number(b.id) - Number(a.id))
  .filter((item) => {
    const key = String(
      item.shipment_id || item.id || ""
    ).trim().toUpperCase();

    if (!key) return true;
    if (seenShipmentIds.has(key)) return false;

    seenShipmentIds.add(key);
    return true;
  });
        


const mappedShipments = deduplicatedShipments.map((item) => ({
  id: String(item.shipment_id || item.id || "").trim(),
  customer: item.customer || "",
  route: `${item.origin || ""} → ${item.destination || ""}`,
  mode: item.service || item.mode || "Air",
  eta: item.eta || "-",
  status: item.status || "Created",
  price_sar: item.price_sar ?? null,
}));

setLiveShipments(mappedShipments);

      }
    } catch (error) {
      console.error("Failed to load shipments:", error);
    }
  }

  loadShipments();
}, []);
  useEffect(() => {
  let cancelled = false;

  async function loadQuotes() {
    try {
      const response = await fetch("/api/quotes", {
        cache: "no-store",
      });
      const data = await response.json();

      if (
        !response.ok ||
        data?.success !== true ||
        !Array.isArray(data.quotes)
      ) {
        throw new Error("Unable to load quotes");
      }

      const rows = data.quotes.map((quote) => ({
        ...quote,
        id: `QT-${String(quote.id).padStart(5, "0")}`,
        company: quote.company || "—",
        origin: quote.origin || "—",
        destination: quote.destination || "—",
        service: quote.service || "—",
        submitted: quote.created_at
          ? new Date(quote.created_at).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
          : "—",
        status: quote.status || "New",
      }));

      if (!cancelled) {
        setLiveQuotes(rows);
      }
    } catch {
      if (!cancelled) {
        setLiveQuotes([]);
        setQuotesError("Unable to load live quote requests.");
      }
    } finally {
      if (!cancelled) {
        setQuotesLoading(false);
      }
    }
  }

  loadQuotes();

  return () => {
    cancelled = true;
  };
}, []);
  const filteredShipments = liveShipments.filter((item) =>
    `${item.id} ${item.customer} ${item.route}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
const quoteTotal = liveQuotes.length;

const quoteNewCount = liveQuotes.filter(
  (quote) => String(quote.status || "New").toLowerCase() === "new"
).length;

const quoteReviewCount = liveQuotes.filter(
  (quote) => String(quote.status || "").toLowerCase() === "under review"
).length;

const quoteConvertedCount = liveQuotes.filter(
  (quote) => String(quote.status || "").toLowerCase() === "converted"
).length;
  return (
    <main className="crm">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f4f4f1;
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
        }

        .crm {
          min-height: 100vh;
          background: #f4f4f1;
        }

        .crmShell {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 250px;
          background: #111315;
          color: #fff;
          padding: 26px 16px;
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 10;
        }

        .brand {
          padding: 4px 12px 28px;
          border-bottom: 1px solid #2d3033;
          margin-bottom: 22px;
        }

        .brandTitle {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 3px;
        }

        .brandSub {
          color: #999;
          font-size: 10px;
          letter-spacing: 2px;
          margin-top: 5px;
        }

        .navLabel {
          color: #666;
          font-size: 10px;
          letter-spacing: 1.5px;
          padding: 0 12px 10px;
          text-transform: uppercase;
        }

        .navItem {
          width: 100%;
          border: 0;
          background: transparent;
          color: #aaa;
          text-align: left;
          padding: 12px;
          border-radius: 7px;
          margin-bottom: 3px;
          font-size: 13px;
          cursor: pointer;
          transition: .2s;
        }

        .navItem:hover {
          background: #202326;
          color: #fff;
        }

        .navItem.active {
          background: #d92f2f;
          color: #fff;
          font-weight: 700;
        }

        .sidebarBottom {
          position: absolute;
          bottom: 25px;
          left: 16px;
          right: 16px;
          border-top: 1px solid #2d3033;
          padding-top: 18px;
        }

        .userBox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
        }

        .avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: #d92f2f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .userName {
          font-size: 12px;
          font-weight: 700;
        }

        .userRole {
          font-size: 10px;
          color: #777;
          margin-top: 3px;
        }

        .content {
          margin-left: 250px;
          width: calc(100% - 250px);
          padding: 28px 34px 50px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 35px;
        }

        .pageKicker {
          font-size: 10px;
          color: #d92f2f;
          letter-spacing: 2px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .pageTitle {
          margin: 0;
          font-size: 32px;
          letter-spacing: -1px;
        }

        .pageDescription {
          color: #777;
          margin: 8px 0 0;
          font-size: 13px;
        }

        .topActions {
          display: flex;
          gap: 10px;
        }

        .search {
          width: 240px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 7px;
          padding: 12px 14px;
          outline: none;
          font-size: 12px;
        }

        .search:focus {
          border-color: #d92f2f;
        }

        .actionBtn {
          border: 0;
          background: #d92f2f;
          color: #fff;
          padding: 12px 17px;
          border-radius: 7px;
          font-weight: 700;
          cursor: pointer;
        }

        .actionBtn.secondary {
          background: #111315;
        }

        .kpis {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .kpi {
          background: #fff;
          border: 1px solid #e3e3e0;
          border-radius: 9px;
          padding: 20px;
        }

        .kpiTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpiLabel {
          color: #777;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .kpiIcon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f8dddd;
          color: #d92f2f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .kpiValue {
          font-size: 30px;
          font-weight: 900;
          margin-top: 18px;
        }

        .kpiChange {
          font-size: 10px;
          color: #25835d;
          margin-top: 7px;
        }

        .dashboardGrid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .card {
          background: #fff;
          border: 1px solid #e3e3e0;
          border-radius: 9px;
          padding: 22px;
        }

        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .cardTitle {
          font-size: 14px;
          font-weight: 800;
        }

        .cardMeta {
          color: #999;
          font-size: 10px;
        }

        .chart {
          height: 190px;
          display: flex;
          align-items: flex-end;
          gap: 10px;
          border-bottom: 1px solid #ddd;
          padding: 10px 5px 0;
        }

        .bar {
          flex: 1;
          background: #111315;
          border-radius: 4px 4px 0 0;
          min-height: 20px;
        }

        .bar:nth-child(3),
        .bar:nth-child(6) {
          background: #d92f2f;
        }

        .chartLabels {
          display: flex;
          justify-content: space-between;
          color: #aaa;
          font-size: 9px;
          padding-top: 8px;
        }

        .exceptions {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .exception {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px;
          background: #f7f7f5;
          border-radius: 7px;
        }

        .exceptionLeft {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d92f2f;
        }

        .dot.orange {
          background: #d98a2f;
        }

        .dot.green {
          background: #25835d;
        }

        .exceptionNumber {
          font-size: 16px;
          font-weight: 900;
        }

        .tableCard {
          padding: 0;
          overflow: hidden;
        }

        .tableHeader {
          padding: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .viewAll {
          color: #d92f2f;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .tableWrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.tableWrap table {
  width: 100%;
  min-width: 760px;
}

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        th {
          text-align: left;
          background: #f7f7f5;
          color: #888;
          font-size: 9px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 12px 20px;
          border-top: 1px solid #e8e8e5;
          border-bottom: 1px solid #e8e8e5;
        }

        td {
          padding: 16px 20px;
          font-size: 12px;
          border-bottom: 1px solid #eee;
        }

        .shipmentId {
          font-weight: 800;
        }

        .customer {
          font-weight: 700;
        }

        .muted {
          color: #888;
        }

        .status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }

        .status.onTime {
          color: #18714d;
          background: #e1f3e9;
        }

        .status.transit {
          color: #315f9b;
          background: #e5eefb;
        }

        .status.delayed {
          color: #a02e2e;
          background: #f9dddd;
        }

        .footerNote {
          margin-top: 18px;
          color: #999;
          font-size: 9px;
          text-align: right;
        }

        @media (max-width: 1050px) {
          .kpis {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboardGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .sidebar {
            
  width: 280px;
            padding: 20px 8px;
            transform: translateX(-100%);
transition: transform 0.25s ease;
z-index: 100;
          }
.sidebar.open {
  transform: translateX(0);
}
.menuOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  border: 0;
  padding: 0;
  margin: 0;
  z-index: 90;
}
          .brandTitle {
            font-size: 0;
          }

          .brandTitle::after {
            content: "KAS";
            font-size: 19px;
          }

          .brandSub,
          .navLabel,
          
          .sidebarBottom {
            display: none;
          }
.navItem span {
  display: inline;
}
          .navItem {
            text-align: left;
            padding: 13px 14px;
            font-size: 14px;
            
            width: 100%;
          }

          .content {
            margin-left: 0;
            width: 100%;
            padding: 20px 14px 35px;
          }

          .topbar {
            display: block;
          }

          .topActions {
            margin-top: 18px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .search {
            width: 100%;
          }

          .actionBtn {
            flex: 1;
          }

          .kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .kpi {
            padding: 15px;
          }

          .kpiValue {
            font-size: 23px;
          }

          .pageTitle {
            font-size: 26px;
          }
        }
      `}</style>

      <div className="crmShell">
         <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="brandTitle">KAS</div>
            <div className="brandSub">LOGISTICS CONTROL CENTER</div>
          </div>

          <div className="navLabel">Workspace</div>

          {menuItems.map((item) => (
            <button
              key={item}
              className={`navItem ${active === item ? "active" : ""}`}
              onClick={() => {
  setActive(item);
  setMobileMenuOpen(false);
}}
            >
              <span>{item}</span>
            </button>
          ))}

          <div className="sidebarBottom">
            <div className="userBox">
              <div className="avatar">KAS</div>
              <div>
                <div className="userName">KAS Admin</div>
                <div className="userRole">Administrator</div>
              </div>
            </div>
          </div>
        </aside>
{mobileMenuOpen && (
  <button
    className="menuOverlay"
    aria-label="Close menu"
    onClick={() => setMobileMenuOpen(false)}
  />
)}
        <section className="content">
          <button
  className="mobileMenuBtn"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
  ☰
</button>
    <header className="topbar">
            <div>
              <div className="pageKicker">KAS LOGISTICS / CRM</div>
              <h1 className="pageTitle">
  {active === "Shipments" && showAllShipments
    ? "All Shipments"
    : active === "Shipments"
    ? "Live Operations"
    : active}
</h1>
              <p className="pageDescription">
                Monitor your logistics operations from one connected workspace.
              </p>
            </div>

            <div className="topActions">
              <input
                className="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shipment, customer..."
              />
              <button
  className="actionBtn"
  onClick={() => {
  setActive("Shipments");
  setShowShipmentForm(true);
}}
>
  + New Shipment
</button>
                
    
              <button
  className="actionBtn"
  onClick={() => {
  setActive("Quotes");
  setShowQuoteForm(true);
}}
>
  + New Quote
</button>
            
              
            </div>
          </header>
{active === "Customers" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL CUSTOMERS</span>
          <span className="kpiIcon">C</span>
        </div>
        <div className="kpiValue">{customers.length}</div>
        <div className="kpiChange">+6 this month</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE CUSTOMERS</span>
          <span className="kpiIcon">A</span>
        </div>
<div className="kpiValue">{customers.filter((customer) => customer.status === "Active").length}</div>
        <div className="kpiChange">{customers.length
  ? (
      customers.filter(
        (customer) => customer.status === "Active"
      ).length / customers.length * 100
    ).toFixed(1) + "%"
  : "0% of total"} of total</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE SHIPMENTS</span>
          <span className="kpiIcon">S</span>
        </div>
        <div className="kpiValue">
  {liveShipments.filter((shipment) => {
    const status = String(shipment.status || "")
      .trim()
      .toLowerCase();

    return ![
      "delivered",
      "completed",
      "cancelled",
      "canceled",
    ].includes(status);
  }).length}
</div>
        <div className="kpiChange">Across all customers</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">CUSTOMER REVENUE</span>
          <span className="kpiIcon">R</span>
        </div>
        <div className="kpiValue">SAR 2.4M</div>
        <div className="kpiChange">+14.8% this year</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Customer Directory</div>
          <div className="cardMeta">
            Customers and active logistics activity
          </div>
        </div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Active Shipments</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
  {customers
              .filter((customer) =>
                `${customer.company} ${customer.contact}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((customer) => (
                <tr key={customer.company}>
                  <td>{customer.company}</td>
                  <td className="muted">{customer.contact}</td>
                  <td>{customer.shipments}</td>
                  <td>{customer.revenue}</td>
                  <td>
                    <span
                      className={`status ${
                        customer.status === "Active"
                          ? "onTime"
                          : "delayed"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
)}

{active === "Bookings" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL BOOKINGS</span>
          <span className="kpiIcon">B</span>
        </div>
        <div className="kpiValue">48</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">CONFIRMED</span>
          <span className="kpiIcon">C</span>
        </div>
        <div className="kpiValue">31</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">PENDING REVIEW</span>
          <span className="kpiIcon">P</span>
        </div>
        <div className="kpiValue">12</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">CANCELLED</span>
          <span className="kpiIcon">X</span>
        </div>
        <div className="kpiValue">5</div>
        <div className="kpiChange">Design preview</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Booking Management</div>
          <div className="cardMeta">
            Design preview only - sample records, not live data
          </div>
        </div>
        <span className="muted">Recent bookings</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Route</th>
              <th>Booking Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {[
              {
                id: "BK-26016",
                customer: "Northstar Retail",
                service: "Air Freight",
                route: "Riyadh - London",
                date: "10 Oct 2026",
                status: "Confirmed",
              },
              {
                id: "BK-26015",
                customer: "Eastern Gate Trading",
                service: "Sea Freight",
                route: "Shanghai - Jeddah",
                date: "09 Oct 2026",
                status: "Pending",
              },
              {
                id: "BK-26014",
                customer: "BlueLine Medical",
                service: "Air Freight",
                route: "Dubai - Riyadh",
                date: "08 Oct 2026",
                status: "Confirmed",
              },
              {
                id: "BK-26013",
                customer: "Summit Industrial",
                service: "Land Freight",
                route: "Riyadh - Dammam",
                date: "07 Oct 2026",
                status: "In Review",
              },
              {
                id: "BK-26012",
                customer: "Cedar Home Supply",
                service: "Warehousing",
                route: "Riyadh",
                date: "06 Oct 2026",
                status: "Cancelled",
              },
            ]
              .filter((booking) =>
                `${booking.id} ${booking.customer} ${booking.service} ${booking.route} ${booking.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((booking) => (
                <tr key={booking.id}>
                  <td className="shipmentId">{booking.id}</td>
                  <td className="customer">{booking.customer}</td>
                  <td>{booking.service}</td>
                  <td className="muted">{booking.route}</td>
                  <td>{booking.date}</td>
                  <td>
                    <span
                      className={`status ${
                        booking.status === "Confirmed"
                          ? "onTime"
                          : booking.status === "Cancelled"
                          ? "delayed"
                          : "transit"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
)}

{active === "Leads" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL LEADS</span>
          <span className="kpiIcon">L</span>
        </div>
        <div className="kpiValue">42</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">NEW</span>
          <span className="kpiIcon">N</span>
        </div>
        <div className="kpiValue">14</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">CONTACTED</span>
          <span className="kpiIcon">C</span>
        </div>
        <div className="kpiValue">18</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">QUALIFIED</span>
          <span className="kpiIcon">Q</span>
        </div>
        <div className="kpiValue">10</div>
        <div className="kpiChange">Design preview</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Lead Pipeline</div>
          <div className="cardMeta">
            Design preview only - sample records, not live data
          </div>
        </div>
        <div className="cardMeta">Recent leads</div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "LD-26016",
                company: "Northstar Retail",
                contact: "Amina Rahman",
                email: "amina@example.com",
                source: "Website",
                created: "10 Oct 2026",
                status: "New",
              },
              {
                id: "LD-26015",
                company: "Eastern Gate Trading",
                contact: "Omar Hassan",
                email: "omar@example.com",
                source: "Referral",
                created: "09 Oct 2026",
                status: "Contacted",
              },
              {
                id: "LD-26014",
                company: "BlueLine Medical",
                contact: "Sara Khalid",
                email: "sara@example.com",
                source: "LinkedIn",
                created: "08 Oct 2026",
                status: "Qualified",
              },
              {
                id: "LD-26013",
                company: "Summit Industrial",
                contact: "Faisal Nasser",
                email: "faisal@example.com",
                source: "Campaign",
                created: "07 Oct 2026",
                status: "Nurture",
              },
              {
                id: "LD-26012",
                company: "Cedar Home Supply",
                contact: "Maya Ali",
                email: "maya@example.com",
                source: "Website",
                created: "06 Oct 2026",
                status: "Disqualified",
              },
            ]
              .filter((lead) =>
                `${lead.id} ${lead.company} ${lead.contact} ${lead.email} ${lead.source} ${lead.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((lead) => {
                const statusClass =
                  lead.status === "Qualified"
                    ? "onTime"
                    : lead.status === "Disqualified"
                    ? "delayed"
                    : "transit";

                return (
                  <tr key={lead.id}>
                    <td className="shipmentId">{lead.id}</td>
                    <td className="customer">{lead.company}</td>
                    <td>
                      <div>{lead.contact}</div>
                      <div className="muted">{lead.email}</div>
                    </td>
                    <td className="muted">{lead.source}</td>
                    <td>{lead.created}</td>
                    <td>
                      <span className={`status ${statusClass}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  </>
)}

{active === "Dashboard" && (
  <>
          <section className="kpis">
            <div className="kpi">
              <div className="kpiTop">
                <span className="kpiLabel">Active Shipments</span>
                <span className="kpiIcon">S</span>
              </div>
              <div className="kpiValue">128</div>
              <div className="kpiChange">+12.4% vs last month</div>
            </div>

            <div className="kpi">
              <div className="kpiTop">
                <span className="kpiLabel">Pending Quotes</span>
                <span className="kpiIcon">Q</span>
              </div>
              <div className="kpiValue">24</div>
              <div className="kpiChange">8 require attention</div>
            </div>

            <div className="kpi">
              <div className="kpiTop">
                <span className="kpiLabel">In Transit</span>
                <span className="kpiIcon">T</span>
              </div>
              <div className="kpiValue">86</div>
              <div className="kpiChange">92% on schedule</div>
            </div>

            <div className="kpi">
              <div className="kpiTop">
                <span className="kpiLabel">On-Time Delivery</span>
                <span className="kpiIcon">%</span>
              </div>
              <div className="kpiValue">94%</div>
              <div className="kpiChange">+2.8% this month</div>
            </div>
          </section>

          <section className="dashboardGrid">
            <div className="card">
              <div className="cardHeader">
                <div className="cardTitle">Shipment Performance</div>
                <div className="cardMeta">Last 30 days</div>
              </div>

              <div className="chart">
                <div className="bar" style={{ height: "42%" }} />
                <div className="bar" style={{ height: "57%" }} />
                <div className="bar" style={{ height: "73%" }} />
                <div className="bar" style={{ height: "48%" }} />
                <div className="bar" style={{ height: "67%" }} />
                <div className="bar" style={{ height: "88%" }} />
                <div className="bar" style={{ height: "64%" }} />
                <div className="bar" style={{ height: "78%" }} />
                <div className="bar" style={{ height: "91%" }} />
                <div className="bar" style={{ height: "70%" }} />
                <div className="bar" style={{ height: "84%" }} />
                <div className="bar" style={{ height: "96%" }} />
              </div>

              <div className="chartLabels">
                <span>W1</span>
                <span>W2</span>
                <span>W3</span>
                <span>W4</span>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <div className="cardTitle">Exceptions</div>
                <div className="cardMeta">10 active</div>
              </div>

              <div className="exceptions">
                <div className="exception">
                  <div className="exceptionLeft">
                    <span className="dot" />
                    Delayed
                  </div>
                  <div className="exceptionNumber">04</div>
                </div>

                <div className="exception">
                  <div className="exceptionLeft">
                    <span className="dot orange" />
                    Customs
                  </div>
                  <div className="exceptionNumber">03</div>
                </div>

                <div className="exception">
                  <div className="exceptionLeft">
                    <span className="dot orange" />
                    Documentation
                  </div>
                  <div className="exceptionNumber">02</div>
                </div>

                <div className="exception">
                  <div className="exceptionLeft">
                    <span className="dot green" />
                    Other
                  </div>
                  <div className="exceptionNumber">01</div>
                </div>
              </div>
            </div>
          </section>
</>
)}
{active === "Shipments" && showShipmentForm && (
  <section className="card" style={{ marginBottom: "18px" }}>
    <div className="cardHeader">
      <div>
        <div className="cardTitle">Create New Shipment</div>
        <div className="cardMeta">
          Enter the shipment details below.
        </div>
      </div>
    </div>

    <form
      onSubmit={async (e) => {
  e.preventDefault();

  const form = e.currentTarget;

  const shipment = {
    shipment_id: form.querySelector('input[placeholder="Shipment ID"]')?.value || "",
    customer: form.querySelector('input[placeholder="Customer"]')?.value || "",
    origin: form.querySelector('input[placeholder="Origin"]')?.value || "",
    destination: form.querySelector('input[placeholder="Destination"]')?.value || "",
    mode: form.querySelector("select")?.value || "Air",
    cargo_type: form.querySelector('input[placeholder="Cargo Type"]')?.value || "",
    weight: form.querySelector('input[placeholder="Weight"]')?.value || "",
    quantity: form.querySelector('input[placeholder="Quantity"]')?.value || "",
    pickup_date: form.querySelector('input[type="date"]')?.value || null,
    eta: form.querySelector('input[placeholder="ETA"]')?.value || "",
    
price_sar:
  form.querySelector('input[placeholder="Price (SAR)"]')?.value === ""
    ? null
    : Number(form.querySelector('input[placeholder="Price (SAR)"]')?.value),

    special_requirements:
      form.querySelector('input[placeholder="Special Requirements"]')?.value || "",
  };

  try {
    const response = await fetch("/api/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipment),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to create shipment");
    }

    alert("Shipment created successfully");
    if (result.shipment) {
  const item = result.shipment;

  setLiveShipments((prev) => [
    {
      id: item.shipment_id || item.id,
      customer: item.customer || "",
      route: `${item.origin || ""} → ${item.destination || ""}`,
      mode: item.service || item.mode || "Air",
      eta: item.eta || "-",
      status: item.status || "Created",
    },
    ...prev,
  ]);
}
    setShowShipmentForm(false);
  } catch (error) {
    alert(`Failed to create shipment: ${error.message}`);
  }
}}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "14px",
        marginTop: "18px",
      }}
    >
      <input
        className="search"
        placeholder="Shipment ID"
      />

      <input
        className="search"
        placeholder="Customer"
      />

      <input
        className="search"
        placeholder="Origin"
      />

      <input
        className="search"
        placeholder="Destination"
      />

      <select className="search" defaultValue="Air">
        <option value="Air">Air Freight</option>
        <option value="Sea">Sea Freight</option>
        <option value="Land">Land Freight</option>
      </select>

      <input
        className="search"
        placeholder="Cargo Type"
      />

      <input
        className="search"
        placeholder="Weight"
      />

      <input
        className="search"
        placeholder="Quantity"
      />

      <input
        className="search"
        type="date"
      />

<input
  type="number"
  min="0"
  step="0.01"
  className="search"
  placeholder="Price (SAR)"
/>

      <input
        className="search"
        placeholder="ETA"
      />

      <input
        className="search"
        placeholder="Special Requirements"
        style={{ gridColumn: "1 / -1" }}
      />

      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "4px",
        }}
      >
        <button
          type="button"
          className="actionBtn"
          onClick={() => setShowShipmentForm(false)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="actionBtn"
        >
          Create Shipment
        </button>
      </div>
    </form>
  </section>
)}
      {(active === "Dashboard" || active === "Shipments") && (  
  <section className="card tableCard">
            <div className="tableHeader">
              <div>
                <div className="cardTitle">
  {showAllShipments ? "All Shipments" : "Live Operations"}
</div>
                <div className="cardMeta">
                  Shipment activity across the KAS network
                </div>
              </div>
              <button
  type="button"
  className="viewAll"
  
onClick={() => {
  setShowShipmentForm(false);
  setShowAllShipments(true);
  setActive("Shipments");
}}

  style={{
    cursor: "pointer",
    background: "transparent",
    border: "none",
    color: "inherit",
    font: "inherit",
  }}
>
  View all →
</button>
            </div>

            <div className="tableWrap shipmentTableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Customer</th>
                    <th>Route</th>
    <th>Price (SAR)</th>
                    <th>Mode</th>
                    <th>ETA</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                   {(showAllShipments ? liveShipments : filteredShipments).map((shipment) => (
                    <tr key={`${shipment.id}-${shipment.customer}`}>
                      <td className="shipmentId">{shipment.id}</td>
                      <td className="customer">{shipment.customer}</td>
                      
<td className="muted">{shipment.route}</td>

                       

<td>{shipment.price_sar == null ? "—" : "SAR " + shipment.price_sar}</td>

                               
                      <td>{shipment.mode}</td>
                      <td>{shipment.eta}</td>
                      <td>
                        <span
                          className={`status ${
                            shipment.status === "On Time"
                              ? "onTime"
                              : shipment.status === "Delayed"
                              ? "delayed"
                              : "transit"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
  )}
      
{active === "Quotes" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL REQUESTS</span>
          <span className="kpiIcon">Q</span>
        </div>
        <div className="kpiValue">{liveQuotes.length}</div>
        <div className="kpiChange">Live data</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">NEW</span>
          <span className="kpiIcon">N</span>
        </div>
        <div className="kpiValue">{quoteNewCount}</div>
        <div className="kpiChange">Live data</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">UNDER REVIEW</span>
          <span className="kpiIcon">R</span>
        </div>
        <div className="kpiValue">{quoteReviewCount}</div>
        <div className="kpiChange">Live data</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">CONVERTED</span>
          <span className="kpiIcon">C</span>
        </div>
        <div className="kpiValue">{quoteConvertedCount}</div>
        <div className="kpiChange">Live data</div>
      </div>
    </section>
{showQuoteForm && (
  <section
    className="card"
    style={{ marginBottom: "18px", padding: "24px" }}
  >
    <div className="cardTitle">Create New Quote</div>
    <p className="cardMeta">
      Enter the customer and shipment details.
    </p>

    <form
      onSubmit={async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const payload = {
          company: String(formData.get("company") || "").trim(),
          name: String(formData.get("name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          origin: String(formData.get("origin") || "").trim(),
          destination: String(formData.get("destination") || "").trim(),
          service: String(formData.get("service") || "Air Freight"),
          cargoType: String(formData.get("cargoType") || "General Cargo"),
        };

        try {
          const response = await fetch("/api/quotes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json().catch(() => ({}));

          if (!response.ok || result.success !== true) {
            throw new Error(
              result.error || "Unable to save the quote."
            );
          }

          alert("Quote saved successfully.");
          setShowQuoteForm(false);
          window.location.reload();
        } catch (error) {
          alert(error.message || "Unable to save the quote.");
        }
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginTop: "18px",
        }}
      >
        <label>
          Company
          <input name="company" required />
        </label>

        <label>
          Contact Name
          <input name="name" required />
        </label>

        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>

        <label>
          Origin
          <input name="origin" required />
        </label>

        <label>
          Destination
          <input name="destination" required />
        </label>

        <label>
          Service
          <select name="service" defaultValue="Air Freight">
            <option value="Air Freight">Air Freight</option>
            <option value="Sea Freight">Sea Freight</option>
            <option value="Land Freight">Land Freight</option>
          </select>
        </label>

        <label>
          Cargo Type
          <input
            name="cargoType"
            defaultValue="General Cargo"
            required
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button type="submit" className="actionBtn">
          Save Quote
        </button>

        <button
          type="button"
          className="actionBtn"
          onClick={() => setShowQuoteForm(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
)}
    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Quote Requests</div>
          <div className="cardMeta">
            Live customer quote requests
          </div>
        </div>
        <div className="cardMeta">Latest requests</div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Quote ID</th>
              <th>Company</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Service</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {liveQuotes
 
                  
              .filter((quote) =>
                `${quote.id} ${quote.company} ${quote.origin} ${quote.destination} ${quote.service} ${quote.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((quote) => (
                <tr key={quote.id}>
                  <td className="shipmentId">{quote.id}</td>
                  <td className="customer">{quote.company}</td>
                  <td className="muted">{quote.origin}</td>
                  <td className="muted">{quote.destination}</td>
                  <td>{quote.service}</td>
                  <td>{quote.submitted}</td>
                  <td>
                    <span
                      className={`status ${
                        quote.status === "New" ||
                        quote.status === "Under Review"
                          ? "transit"
                          : quote.status === "Rejected"
                          ? "delayed"
                          : "onTime"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
)}
    
{active === "Control Tower" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE SHIPMENTS</span>
          <span className="kpiIcon">A</span>
        </div>
        <div className="kpiValue">{liveShipments.filter((s) => !["delivered", "cancelled", "canceled"].includes(String(s.status || "").trim().toLowerCase())).length}</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">IN TRANSIT</span>
          <span className="kpiIcon">T</span>
        </div>
        <div className="kpiValue">{liveShipments.filter((s) => ["in transit", "transit"].includes(String(s.status || "").trim().toLowerCase())).length}</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">DELAYED</span>
          <span className="kpiIcon">!</span>
        </div>
        <div className="kpiValue">{liveShipments.filter((s) => {
  const status = String(s.status || "").trim().toLowerCase();
  const etaText = String(s.eta || "").trim();
  const eta = etaText && etaText !== "—" && !/tomorrow|today|yesterday/i.test(etaText) ? new Date(etaText) : null;
  const isOverdue = eta && !Number.isNaN(eta.getTime()) && eta < new Date();
  return /delayed|delay|at risk|overdue|exception/.test(status) ||
    (isOverdue && !["delivered", "cancelled", "canceled"].includes(status));
}).length}</div>
        <div className="kpiChange">Requires attention</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">DELIVERED</span>
          <span className="kpiIcon">D</span>
        </div>
        <div className="kpiValue">{liveShipments.filter((s) => String(s.status || "").trim().toLowerCase() === "delivered").length}</div>
        <div className="kpiChange">Design preview</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Shipment Control Tower</div>
          <div className="cardMeta">
            Shipment records loaded from CRM
          </div>
        </div>
        <span className="muted">Operational overview</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Mode</th>
              <th>ETA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
  {liveShipments
              .filter((shipment) =>
                `${shipment.id} ${shipment.customer} ${shipment.route} ${shipment.mode} ${shipment.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((shipment) => (
                <tr key={shipment.id}>
                  <td className="shipmentId">{shipment.id}</td>
                  <td className="customer">{shipment.customer}</td>
                  <td className="muted">{shipment.route}</td>
                  <td>{shipment.mode}</td>
                  <td>{shipment.eta}</td>
                  <td>
                    <span
                      className={`status ${
                        shipment.status === "On Time"
                          ? "onTime"
                          : shipment.status === "Delayed"
                          ? "delayed"
                          : "transit"
                      }`}
                    >
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
            
<section className="card tableCard">
  <div className="tableHeader">
    <div>
      <div className="cardTitle">Operational Exceptions</div>
      <div className="cardMeta">
        Shipments requiring operational follow-up
      </div>
    </div>
    <span className="muted">
      {liveShipments.filter((shipment) =>
        /delayed|delay|at risk|overdue|exception|on hold|failed|customs hold|clearance issue/i.test(
          String(shipment.status || "")
        )
      ).length} exceptions
    </span>
  </div>

  <div className="tableWrap">
    <table>
      <thead>
        <tr>
          <th>Shipment ID</th>
          <th>Customer</th>
          <th>Route</th>
          <th>Status</th>
          <th>ETA</th>
          <th>Recommended Action</th>
        </tr>
      </thead>
      <tbody>
{liveShipments.filter(isOperationalException).length === 0 ? (
          <tr>
            <td colSpan={6}>
              No shipments are currently flagged for operational attention.
            </td>
          </tr>
        ) : (
          liveShipments
            .filter((shipment) =>
              /delayed|delay|at risk|overdue|exception|on hold|failed|customs hold|clearance issue/i.test(
                String(shipment.status || "")
              )
            )
            .map((shipment, index) => {
              const status = String(shipment.status || "").toLowerCase();

              const action = /customs|clearance/.test(status)
                ? "Verify customs clearance"
                : /delay|overdue|late/.test(status)
                  ? "Contact carrier and confirm revised ETA"
                  : /hold/.test(status)
                    ? "Review hold reason and assign follow-up"
                    : "Review shipment and assign follow-up";

              return (
                <tr key={`exception-${shipment.id || "shipment"}-${index}`}>
                  <td className="shipmentId">{shipment.id || "—"}</td>
                  <td className="customer">{shipment.customer || "—"}</td>
                  <td className="muted">{shipment.route || "—"}</td>
                  <td>{shipment.status || "—"}</td>
                  <td>{shipment.eta || "—"}</td>
                  <td>{action}</td>
                </tr>
              );
            })
        )}
      </tbody>
    </table>
  </div>
</section>

  </>
)}

{active === "Documents" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL DOCUMENTS</span>
          <span className="kpiIcon">D</span>
        </div>
        <div className="kpiValue">286</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">APPROVED</span>
          <span className="kpiIcon">A</span>
        </div>
        <div className="kpiValue">214</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">PENDING REVIEW</span>
          <span className="kpiIcon">P</span>
        </div>
        <div className="kpiValue">18</div>
        <div className="kpiChange">Awaiting review</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">EXPIRING SOON</span>
          <span className="kpiIcon">!</span>
        </div>
        <div className="kpiValue">7</div>
        <div className="kpiChange">Requires attention</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Document Register</div>
          <div className="cardMeta">
            Design preview only - sample records, not live data
          </div>
        </div>
        <span className="muted">Document lifecycle</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Shipment / Customer</th>
              <th>Last Updated</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "DOC-26107",
                name: "Bill of Lading",
                shipment: "KAS-26081",
                customer: "Northstar Retail",
                updated: "10 Oct 2026",
                expiry: "12 Oct 2026",
                status: "Approved",
              },
              {
                id: "DOC-26106",
                name: "Commercial Invoice",
                shipment: "KAS-26082",
                customer: "Eastern Gate Trading",
                updated: "10 Oct 2026",
                expiry: "Not applicable",
                status: "Pending Review",
              },
              {
                id: "DOC-26105",
                name: "Air Waybill",
                shipment: "KAS-26083",
                customer: "BlueLine Medical",
                updated: "09 Oct 2026",
                expiry: "12 Oct 2026",
                status: "Expiring Soon",
              },
              {
                id: "DOC-26104",
                name: "Packing List",
                shipment: "KAS-26084",
                customer: "Summit Industrial",
                updated: "08 Oct 2026",
                expiry: "Not applicable",
                status: "Approved",
              },
              {
                id: "DOC-26103",
                name: "Certificate of Origin",
                shipment: "KAS-26085",
                customer: "Cedar Home Supply",
                updated: "07 Oct 2026",
                expiry: "02 Oct 2026",
                status: "Expired",
              },
            ]
              .filter((doc) =>
                `${doc.id} ${doc.name} ${doc.shipment} ${doc.customer} ${doc.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.name}</strong>
                    <div className="muted">{doc.id}</div>
                  </td>
                  <td>
                    <div>{doc.shipment}</div>
                    <div className="muted">{doc.customer}</div>
                  </td>
                  <td>{doc.updated}</td>
                  <td>{doc.expiry}</td>
                  <td>
                    <span
                      className={`status ${
                        doc.status === "Approved"
                          ? "onTime"
                          : doc.status === "Expired" ||
                            doc.status === "Expiring Soon"
                          ? "delayed"
                          : "transit"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Digital Document Controls</div>
          <div className="cardMeta">
            Planned capabilities - not active in this preview
          </div>
        </div>
      </div>

      <div style={{
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px"
      }}>
        <div>
          <strong>Version History</strong>
          <div className="muted">
            Track document revisions and updates.
          </div>
        </div>
        <div>
          <strong>Audit Trail</strong>
          <div className="muted">
            Record approvals and document changes.
          </div>
        </div>
        <div>
          <strong>Expiry Monitoring</strong>
          <div className="muted">
            Identify documents requiring renewal.
          </div>
        </div>
        <div>
          <strong>Digital Integration</strong>
          <div className="muted">
            Prepare for secure APIs and digital shipping documents.
          </div>
        </div>
      </div>
    </section>
  </>
)}

{active === "Finance" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">TOTAL REVENUE</span>
          <span className="kpiIcon">R</span>
        </div>
        <div className="kpiValue">SAR 2.4M</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">OUTSTANDING</span>
          <span className="kpiIcon">O</span>
        </div>
        <div className="kpiValue">SAR 380K</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">PAID INVOICES</span>
          <span className="kpiIcon">P</span>
        </div>
        <div className="kpiValue">184</div>
        <div className="kpiChange">Design preview</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">OVERDUE</span>
          <span className="kpiIcon">!</span>
        </div>
        <div className="kpiValue">12</div>
        <div className="kpiChange">Requires attention</div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Invoice Register</div>
          <div className="cardMeta">
            Design preview only - sample financial records
          </div>
        </div>
        <span className="muted">Accounts receivable</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Shipment</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Amount (SAR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                id: "INV-26107",
                customer: "Northstar Retail",
                shipment: "KAS-26081",
                issue: "10 Oct 2026",
                due: "24 Oct 2026",
                amount: "18,500",
                status: "Paid",
              },
              {
                id: "INV-26106",
                customer: "Eastern Gate Trading",
                shipment: "KAS-26082",
                issue: "09 Oct 2026",
                due: "23 Oct 2026",
                amount: "42,000",
                status: "Pending",
              },
              {
                id: "INV-26105",
                customer: "BlueLine Medical",
                shipment: "KAS-26083",
                issue: "01 Oct 2026",
                due: "09 Oct 2026",
                amount: "12,800",
                status: "Overdue",
              },
              {
                id: "INV-26104",
                customer: "Summit Industrial",
                shipment: "KAS-26084",
                issue: "08 Oct 2026",
                due: "22 Oct 2026",
                amount: "26,400",
                status: "Pending",
              },
              {
                id: "INV-26103",
                customer: "Cedar Home Supply",
                shipment: "KAS-26085",
                issue: "05 Oct 2026",
                due: "19 Oct 2026",
                amount: "9,750",
                status: "Paid",
              },
            ]
              .filter((invoice) =>
                `${invoice.id} ${invoice.customer} ${invoice.shipment} ${invoice.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((invoice) => (
                <tr key={invoice.id}>
                  <td className="shipmentId">{invoice.id}</td>
                  <td className="customer">{invoice.customer}</td>
                  <td className="muted">{invoice.shipment}</td>
                  <td>{invoice.issue}</td>
                  <td>{invoice.due}</td>
                  <td>{invoice.amount}</td>
                  <td>
                    <span
                      className={`status ${
                        invoice.status === "Paid"
                          ? "onTime"
                          : invoice.status === "Overdue"
                          ? "delayed"
                          : "transit"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Financial Operations</div>
          <div className="cardMeta">
            Planned capabilities - not active in this preview
          </div>
        </div>
      </div>

      <div style={{
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px"
      }}>
        <div>
          <strong>Accounts Receivable</strong>
          <div className="muted">
            Monitor customer balances and outstanding invoices.
          </div>
        </div>
        <div>
          <strong>Payment Reconciliation</strong>
          <div className="muted">
            Prepare to match receipts against invoices.
          </div>
        </div>
        <div>
          <strong>Overdue Monitoring</strong>
          <div className="muted">
            Identify overdue invoices for follow-up.
          </div>
        </div>
        <div>
          <strong>Financial Reporting</strong>
          <div className="muted">
            Prepare revenue and receivables reporting.
          </div>
        </div>
      </div>
    </section>
  </>
)}

{active === "Analytics" && (
  <>
    <section className="kpis">
      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ON-TIME DELIVERY</span>
          <span className="kpiIcon">%</span>
        </div>
        <div className="kpiValue">94.2%</div>
        <div className="kpiChange">Sample performance</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE SHIPMENTS</span>
          <span className="kpiIcon">S</span>
        </div>
        <div className="kpiValue">128</div>
        <div className="kpiChange">Sample data</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">AVG TRANSIT TIME</span>
          <span className="kpiIcon">T</span>
        </div>
        <div className="kpiValue">3.8 days</div>
        <div className="kpiChange">Sample data</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">OPEN EXCEPTIONS</span>
          <span className="kpiIcon">!</span>
        </div>
        <div className="kpiValue">
  {liveShipments.filter((shipment) =>
    /delayed|exception|customs|hold|at risk/i.test(
      String(shipment.status || "")
    )
  ).length}
</div>
        <div className="kpiChange">Calculated from CRM shipment statuses</div>
      </div>
    </section>

    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      <div className="card" style={{ padding: "20px", minWidth: 0 }}>
        <div className="cardTitle">On-Time Delivery Trend</div>
        <div className="cardMeta">
          Illustrative monthly performance
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            height: "190px",
            marginTop: "24px",
          }}
        >
          {[
            { month: "May", rate: 91 },
            { month: "Jun", rate: 93 },
            { month: "Jul", rate: 92 },
            { month: "Aug", rate: 95 },
            { month: "Sep", rate: 94 },
            { month: "Oct", rate: 94.2 },
          ].map((item) => (
            <div
              key={item.month}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 600 }}>
                {item.rate}%
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${item.rate * 1.25}px`,
                  maxHeight: "140px",
                  background: "#dc2626",
                  borderRadius: "5px 5px 0 0",
                }}
              />
              <span style={{ fontSize: "12px", color: "#777" }}>
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "20px", minWidth: 0 }}>
        <div className="cardTitle">Shipment Mode Mix</div>
        <div className="cardMeta">
          Illustrative distribution by transport mode
        </div>

        <div style={{ display: "grid", gap: "22px", marginTop: "26px" }}>
          {[
            { mode: "Sea Freight", share: 42 },
            { mode: "Air Freight", share: 34 },
            { mode: "Land Freight", share: 24 },
          ].map((item) => (
            <div key={item.mode}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <span>{item.mode}</span>
                <strong>{item.share}%</strong>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "9px",
                  background: "#ededed",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.share}%`,
                    height: "100%",
                    background: "#dc2626",
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="cardMeta" style={{ marginTop: "22px" }}>
          Sample distribution - not connected to live shipments.
        </div>
      </div>
    </section>

    <section className="card tableCard">
      <div className="tableHeader">
        <div>
          <div className="cardTitle">Route Performance</div>
          <div className="cardMeta">
            Design preview only - sample operational metrics
          </div>
        </div>
        <span className="muted">Lane analysis</span>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Mode</th>
              <th>Shipments</th>
              <th>On-Time Rate</th>
              <th>Avg Transit</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                route: "Riyadh - Dubai",
                mode: "Air",
                shipments: 42,
                onTime: "96%",
                transit: "1.4 days",
                status: "On Target",
              },
              {
                route: "Shanghai - Jeddah",
                mode: "Sea",
                shipments: 31,
                onTime: "91%",
                transit: "18 days",
                status: "Monitor",
              },
              {
                route: "Riyadh - Dammam",
                mode: "Land",
                shipments: 26,
                onTime: "89%",
                transit: "1.1 days",
                status: "Review",
              },
            ]
              .filter((item) =>
                `${item.route} ${item.mode} ${item.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
              .map((item) => (
                <tr key={item.route}>
                  <td className="customer">{item.route}</td>
                  <td>{item.mode}</td>
                  <td>{item.shipments}</td>
                  <td>{item.onTime}</td>
                  <td>{item.transit}</td>
                  <td>
                    <span
                      className={`status ${
                        item.status === "On Target"
                          ? "onTime"
                          : item.status === "Review"
                          ? "delayed"
                          : "transit"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="card tableCard" style={{ padding: "20px" }}>
      <div className="cardTitle">Decision Support Preview</div>
      <div className="cardMeta">
        Illustrative insights - not generated from live data or active AI.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "22px",
        }}
      >
        <div>
          <strong>Delay Risk</strong>
          <p className="muted">
            Highlight routes where late deliveries may increase.
          </p>
        </div>
        <div>
          <strong>Transit Time Variance</strong>
          <p className="muted">
            Compare actual transit time against planned service levels.
          </p>
        </div>
        <div>
          <strong>Human Review</strong>
          <p className="muted">
            Present exceptions for team review before operational action.
          </p>
        </div>
      </div>
    </section>
  </>
)}

    <div className="footerNote">
            KAS CRM • Demo interface • Connected data will be added in the
            backend phase
          </div>
        </section>
      </div>
    </main>
  );
}
