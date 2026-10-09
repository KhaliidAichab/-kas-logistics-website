"use client";

import { useEffect, useState } from "react";

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
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [liveShipments, setLiveShipments] = useState([]);

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
  .sort((a, b) => Number(a.id) - Number(b.id))
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
}));

setLiveShipments(mappedShipments);

          id: item.shipment_id || item.id,
          customer: item.customer || "",
          route: `${item.origin || ""} → ${item.destination || ""}`,
          mode: item.service || item.mode || "Air",
          eta: item.eta || "-",
          status: item.status || "Created",
        }));

        setLiveShipments(mappedShipments);
      }
    } catch (error) {
      console.error("Failed to load shipments:", error);
    }
  }

  loadShipments();
}, []);
  const filteredShipments = liveShipments.filter((item) =>
    `${item.id} ${item.customer} ${item.route}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          overflow-x: auto;
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
              <h1 className="pageTitle">{active}</h1>
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
  onClick={() => setActive("Quotes")}
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
        <div className="kpiValue">48</div>
        <div className="kpiChange">+6 this month</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE CUSTOMERS</span>
          <span className="kpiIcon">A</span>
        </div>
        <div className="kpiValue">42</div>
        <div className="kpiChange">87.5% of total</div>
      </div>

      <div className="kpi">
        <div className="kpiTop">
          <span className="kpiLabel">ACTIVE SHIPMENTS</span>
          <span className="kpiIcon">S</span>
        </div>
        <div className="kpiValue">128</div>
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
            {[
              {
                company: "ABC Trading",
                contact: "Ahmed Alharbi",
                shipments: 18,
                revenue: "SAR 420K",
                status: "Active",
              },
              {
                company: "Gulf Industries",
                contact: "Mohammed Alotaibi",
                shipments: 24,
                revenue: "SAR 680K",
                status: "Active",
              },
              {
                company: "Nile Retail",
                contact: "Omar Hassan",
                shipments: 12,
                revenue: "SAR 295K",
                status: "Active",
              },
              {
                company: "MedCare Pharma",
                contact: "Sara Khalid",
                shipments: 16,
                revenue: "SAR 510K",
                status: "Active",
              },
              {
                company: "Riyadh Manufacturing",
                contact: "Faisal Ahmed",
                shipments: 9,
                revenue: "SAR 185K",
                status: "Review",
              },
            ]
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
                <div className="cardTitle">Live Operations</div>
                <div className="cardMeta">
                  Shipment activity across the KAS network
                </div>
              </div>
              <button
  type="button"
  className="viewAll"
  onClick={() => {
    setShowShipmentForm(false);
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

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Mode</th>
                    <th>ETA</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShipments.map((shipment) => (
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
