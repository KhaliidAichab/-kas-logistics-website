"use client";

import { useMemo, useState } from "react";

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    company: "Riyadh Trading Co.",
    contact: "Ahmed Mohammed",
    email: "ahmed@riyadhtrading.com",
    phone: "+966 55 123 4567",
    country: "Saudi Arabia",
    status: "Active",
  },
  {
    id: 2,
    company: "Gulf Industrial Group",
    contact: "Sara Khalid",
    email: "sara@gulfindustrial.com",
    phone: "+966 54 234 5678",
    country: "Saudi Arabia",
    status: "Active",
  },
  {
    id: 3,
    company: "Africa Trade Partners",
    contact: "Omar Hassan",
    email: "omar@africatrade.com",
    phone: "+971 50 345 6789",
    country: "UAE",
    status: "Prospect",
  },
];

const EMPTY_FORM = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  country: "",
  status: "Active",
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  padding: "11px 12px",
  boxSizing: "border-box",
  border: "1px solid #35445a",
  borderRadius: "8px",
  background: "#0b1220",
  color: "#ffffff",
  fontSize: "16px",
};

const secondaryButtonStyle = {
  minHeight: "40px",
  padding: "9px 13px",
  border: "1px solid #46566d",
  borderRadius: "8px",
  background: "#202d40",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "14px",
};

const primaryButtonStyle = {
  minHeight: "44px",
  padding: "11px 16px",
  border: 0,
  borderRadius: "8px",
  background: "#d53236",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "14px",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const searchableValues = [
        customer.company,
        customer.contact,
        customer.email,
        customer.phone,
        customer.country,
      ];

      const matchesSearch = searchableValues.some((value) =>
        value.toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  function openNewCustomer() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditCustomer(customer) {
    setEditingId(customer.id);
    setForm({
      company: customer.company,
      contact: customer.contact,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      status: customer.status,
    });
    setFormError("");
    setNotice("");
    setShowForm(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const cleaned = {
      company: form.company.trim(),
      contact: form.contact.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      status: form.status,
    };

    if (
      !cleaned.company ||
      !cleaned.contact ||
      !cleaned.email ||
      !cleaned.country
    ) {
      setFormError("Complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    const duplicateEmail = customers.some(
      (customer) =>
        customer.email.toLowerCase() === cleaned.email &&
        customer.id !== editingId
    );

    if (duplicateEmail) {
      setFormError("A customer with this email already exists.");
      return;
    }

    if (editingId !== null) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingId
            ? { ...customer, ...cleaned }
            : customer
        )
      );
      setNotice("Customer updated successfully.");
    } else {
      const nextId =
        customers.reduce(
          (maxId, customer) => Math.max(maxId, customer.id),
          0
        ) + 1;

      setCustomers((previous) => [
        ...previous,
        { id: nextId, ...cleaned },
      ]);
      setNotice("Customer added successfully.");
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  const cardStyle = {
    padding: "18px",
    border: "1px solid #273449",
    borderRadius: "12px",
    background: "#151f30",
    minWidth: 0,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px",
        boxSizing: "border-box",
        background: "#0b1220",
        color: "#f8fafc",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "26px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#e33b40",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "2px",
              }}
            >
              KAS LOGISTICS
            </p>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "clamp(28px, 6vw, 36px)",
                lineHeight: 1.2,
              }}
            >
              Customers
            </h1>

            <p style={{ color: "#9ba8bb", margin: 0, lineHeight: 1.5 }}>
              Manage your customer relationships.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewCustomer}
            style={primaryButtonStyle}
          >
            + Add Customer
          </button>
        </header>

        <section
          aria-label="Customer summary"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(145px, 1fr))",
            gap: "12px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Total Customers", customers.length],
            [
              "Active",
              customers.filter((customer) => customer.status === "Active")
                .length,
            ],
            [
              "Prospects",
              customers.filter((customer) => customer.status === "Prospect")
                .length,
            ],
            [
              "Inactive",
              customers.filter((customer) => customer.status === "Inactive")
                .length,
            ],
          ].map(([label, value]) => (
            <div key={label} style={cardStyle}>
              <p
                style={{
                  color: "#9ba8bb",
                  margin: "0 0 12px",
                  fontSize: 14,
                }}
              >
                {label}
              </p>
              <strong style={{ fontSize: "28px" }}>{value}</strong>
            </div>
          ))}
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <input
              aria-label="Search customers"
              type="search"
              placeholder="Search company, contact, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, flex: "1 1 240px" }}
            />

            <select
              aria-label="Filter customers by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{ ...inputStyle, flex: "0 1 170px" }}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {notice && (
            <p role="status" style={{ color: "#86efac", lineHeight: 1.5 }}>
              {notice}
            </p>
          )}

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "16px",
                marginBottom: "22px",
                border: "1px solid #35445a",
                borderRadius: "10px",
              }}
            >
              <h2 style={{ fontSize: "20px", margin: "0 0 18px" }}>
                {editingId !== null ? "Edit Customer" : "New Customer"}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "14px",
                }}
              >
                {[
                  ["company", "Company name", true],
                  ["contact", "Contact person", true],
                  ["email", "Business email", true],
                  ["phone", "Phone number", false],
                  ["country", "Country", true],
                ].map(([key, label, required]) => (
                  <label
                    key={key}
                    style={{
                      display: "grid",
                      gap: "7px",
                      color: "#cbd5e1",
                      fontSize: "13px",
                    }}
                  >
                    {label}

                    <input
                      type={key === "email" ? "email" : "text"}
                      autoComplete={key === "email" ? "email" : "off"}
                      required={required}
                      value={form[key]}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          [key]: event.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                  </label>
                ))}

                <label
                  style={{
                    display: "grid",
                    gap: "7px",
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  Status

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {formError && (
                <p
                  role="alert"
                  style={{
                    color: "#fca5a5",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {formError}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <button type="submit" style={primaryButtonStyle}>
                  Save Customer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                minWidth: "680px",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ color: "#9ba8bb" }}>
                  {["Company", "Contact", "Country", "Status", "Action"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        style={{
                          padding: "14px 10px",
                          borderBottom: "1px solid #35445a",
                          fontWeight: 600,
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td
                      style={{
                        padding: "15px 10px",
                        borderBottom: "1px solid #273449",
                        verticalAlign: "top",
                      }}
                    >
                      <strong>{customer.company}</strong>
                      <div
                        style={{
                          color: "#9ba8bb",
                          marginTop: "6px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {customer.email}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 10px",
                        borderBottom: "1px solid #273449",
                        verticalAlign: "top",
                      }}
                    >
                      {customer.contact}
                      <div style={{ color: "#9ba8bb", marginTop: "6px" }}>
                        {customer.phone || "—"}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 10px",
                        borderBottom: "1px solid #273449",
                        verticalAlign: "top",
                      }}
                    >
                      {customer.country}
                    </td>

                    <td
                      style={{
                        padding: "15px 10px",
                        borderBottom: "1px solid #273449",
                        verticalAlign: "top",
                      }}
                    >
                      <span
                        style={{
                          color:
                            customer.status === "Active"
                              ? "#86efac"
                              : customer.status === "Prospect"
                                ? "#fcd34d"
                                : "#cbd5e1",
                        }}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px 10px",
                        borderBottom: "1px solid #273449",
                        verticalAlign: "top",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => openEditCustomer(customer)}
                        style={secondaryButtonStyle}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <p
              style={{
                color: "#9ba8bb",
                textAlign: "center",
                padding: "24px 8px",
                lineHeight: 1.5,
              }}
            >
              No customers found. Try changing your search or filters.
            </p>
          )}

          <p
            style={{
              color: "#9ba8bb",
              fontSize: "12px",
              lineHeight: 1.6,
              margin: "16px 0 0",
            }}
          >
            Showing {filteredCustomers.length} of {customers.length} customers.
            Demo data only; changes are not saved to a database.
          </p>
        </section>
      </div>
    </main>
  );
}
