"use client";

import { useState } from "react";

const services = [
  ["01", "Air Freight", "Fast, reliable air cargo solutions for time-sensitive shipments."],
  ["02", "Sea Freight", "FCL, LCL, reefer, project and specialized ocean cargo."],
  ["03", "Land Freight", "FTL, LTL, oversized, DG and temperature-controlled transport."],
  ["04", "Warehousing", "Storage, labeling, packaging, inventory and distribution."],
  ["05", "Project Logistics", "Multimodal, chartering, break bulk, RO-RO and project cargo."],
  ["06", "Digital Logistics", "Tracking, digital quotations, CRM and connected operations."],
];

const industries = [
  ["E-Commerce", "Fulfillment, distribution and customer visibility."],
  ["Healthcare & Pharma", "Controlled, time-sensitive and specialized cargo."],
  ["Industrial", "Heavy, oversized and project supply chains."],
  ["Automotive", "Parts, vehicles and time-critical movements."],
  ["Energy", "Complex logistics for demanding operational environments."],
  ["Retail", "Reliable inbound, storage and distribution flows."],
];

export default function Home() {
    useEffect(() => {
    const reportError = (event) => {
      window.alert(
        "JavaScript error: " +
        event.message +
        "\nLine: " + event.lineno
      );
    };

    window.addEventListener("error", reportError);

    return () => {
      window.removeEventListener("error", reportError);
    };
  }, []);
  const [menu, setMenu] = useState(false);
  const [lang, setLang] = useState("EN");
  const [tracking, setTracking] = useState("");
  const [trackResult, setTrackResult] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
const [quoteStep, setQuoteStep] = useState(1);
const [quoteSubmitting, setQuoteSubmitting] = useState(false);
const [quoteError, setQuoteError] = useState("");
const [quoteData, setQuoteData] = useState({
  origin: "",
  destination: "",
  service: "Air Freight",
  cargoType: "General Cargo",
  weight: "",
  quantity: "",
  dimensions: "",
  pickupDate: "",
  requirements: "",
  company: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
});
  const ar = lang === "AR";

  function submitTrack(e) {
    e.preventDefault();
    setTrackResult(Boolean(tracking.trim()));
  }
function updateQuote(field, value) {
  setQuoteData((prev) => ({
    ...prev,
    [field]: value,
  }));
}

function nextQuoteStep() {
  setQuoteStep((prev) => Math.min(prev + 1, 4));
}

function previousQuoteStep() {
  setQuoteStep((prev) => Math.max(prev - 1, 1));
  
async function submitQuote() {
  setQuoteError("");

  if (
    !quoteData.cargoType ||
    !quoteData.company?.trim() ||
    !quoteData.phone?.trim()
  ) {
    setQuoteError(
      ar
        ? "يرجى تعبئة نوع الشحنة واسم الشركة ورقم الهاتف."
        : "Please enter cargo type, company, and phone number."
    );
    return;
  }

  setQuoteSubmitting(true);

  try {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quoteData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      console.error("Quote submission failed:", result);

      setQuoteError(
        ar
          ? "تعذر حفظ الطلب. يرجى المحاولة لاحقًا."
          : "Unable to save the request. Please try again."
      );
      return;
    }

    setQuoteStep(4);
  } catch (error) {
    console.error("Quote submission failed:", error);

    setQuoteError(
      ar
        ? "تعذر الاتصال بالخادم."
        : "Unable to connect to the server."
    );
  } finally {
    setQuoteSubmitting(false);
  }
}

}
  return (
    <main className={ar ? "site rtl" : "site"}>
      <header className="header">
        <div className="container nav">
          <a href="#top" className="logoWrap" aria-label="KAS Logistics">
            <img src="/kas-logo.png" className="logo" alt="KAS Logistics Services" />
          </a>

          <nav className={menu ? "navLinks open" : "navLinks"}>
            <a href="#services" onClick={() => setMenu(false)}>{ar ? "الخدمات" : "Services"}</a>
            <a href="#industries" onClick={() => setMenu(false)}>{ar ? "القطاعات" : "Industries"}</a>
            <a href="#network" onClick={() => setMenu(false)}>{ar ? "الشبكة" : "Global Network"}</a>
            <a href="#digital" onClick={() => setMenu(false)}>{ar ? "الحلول الرقمية" : "Digital Solutions"}</a>
            <a href="#about" onClick={() => setMenu(false)}>{ar ? "عن KAS" : "About KAS"}</a>
            <a href="#contact" onClick={() => setMenu(false)}>{ar ? "تواصل" : "Contact"}</a>
          </nav>

          <div className="navActions">
            <button className="langBtn" onClick={() => setLang(ar ? "EN" : "AR")}>{ar ? "EN" : "AR"} ↗</button>
            <button className="quoteBtn" onClick={() => setQuoteOpen(true)}>{ar ? "اطلب عرض سعر" : "Get a Quote"} →</button>
            <button className="menuBtn" onClick={() => setMenu(!menu)} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="heroImage" aria-hidden="true"></div>
        <div className="heroShade"></div>
        <div className="container heroGrid">
          <div className="heroCopy">
            <div className="eyebrow"><i></i>{ar ? "خدمات لوجستية تتجاوز الحدود" : "LOGISTICS BEYOND BORDERS"}</div>
            <h1>
              {ar ? <>نحرّك ما<br /><span>يحرّك العالم.</span></> : <>WE MOVE WHAT<br /><span>MOVES THE WORLD.</span></>}
            </h1>
            <p className="heroLead">
              {ar
                ? "حلول لوجستية متكاملة تربط الشرق الأوسط وأفريقيا بالعالم، مبنية على الرؤية والموثوقية وطريقة تحرك أعمالك."
                : "End-to-end logistics connecting the Middle East, Africa and the world. Built around visibility, reliability and the way your business moves."}
            </p>
            <div className="heroButtons">
              <button className="primaryBtn" onClick={() => setQuoteOpen(true)}>{ar ? "اطلب عرض سعر" : "Get a Quote"} →</button>
              <a className="ghostBtn" href="#tracking">{ar ? "تتبع شحنتك" : "Track Shipment"} ↗</a>
            </div>
            <div className="heroMeta">
              <div><strong>2023</strong><span>{ar ? "تأسست في الرياض" : "Founded in Riyadh"}</span></div>
              <div><strong>7+</strong><span>{ar ? "أسواق ضمن الشبكة" : "Network markets"}</span></div>
              <div><strong>MENA</strong><span>{ar ? "الشرق الأوسط وأفريقيا" : "Core region"}</span></div>
            </div>
          </div>

          <div className="heroPanel">
            <div className="panelTop"><span>KAS CONTROL TOWER</span><b><i></i> LIVE</b></div>
            <div className="routeLine">
              <div><small>ORIGIN</small><strong>GLOBAL</strong></div>
              <div className="routeDots"><i></i><span></span><i></i><span></span><i></i></div>
              <div><small>DESTINATION</small><strong>MENA / AFRICA</strong></div>
            </div>
            <form className="trackForm" onSubmit={submitTrack}>
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Enter tracking number" />
              <button>TRACK →</button>
            </form>
            {trackResult && (
              <div className="trackResult">
                <b>{tracking.toUpperCase()}</b>
                <span>● Tracking reference received</span>
                <small>Connect this form to the production tracking API when credentials are available.</small>
              </div>
            )}
            <div className="panelStats">
              <div><strong>Air</strong><span>Fast lanes</span></div>
              <div><strong>Sea</strong><span>Global gateways</span></div>
              <div><strong>Land</strong><span>Regional reach</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trustStrip">
        <div className="container trustGrid">
          <div><span>01</span><b>One connected flow</b><small>From origin to final delivery</small></div>
          <div><span>02</span><b>Regional expertise</b><small>Middle East & Africa focus</small></div>
          <div><span>03</span><b>Digital visibility</b><small>Operations built around data</small></div>
          <div><span>04</span><b>Project capability</b><small>Complex cargo, simplified</small></div>
        </div>
      </section>

      <section id="services" className="section servicesSection">
        <div className="container">
          <div className="sectionHead">
            <div><div className="kicker">OUR SERVICES</div><h2>{ar ? "حلول لوجستية من البداية إلى النهاية" : "End-to-End Logistics Solutions"}</h2></div>
            <p>{ar ? "شبكة متكاملة من الشحن والتخزين والمشاريع والحلول الرقمية تحت مظلة واحدة." : "A connected portfolio of freight, warehousing, project logistics and digital solutions under one roof."}</p>
          </div>
          <div className="serviceGrid">
            {services.map(([n, title, text]) => (
              <article className="serviceCard" key={n}>
                <span className="serviceNo">{n}</span>
                <div className="serviceIcon">{n}</div>
                <h3>{ar ? title : title}</h3>
                <p>{text}</p>
                <a href="#contact">Explore →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="section darkSection">
        <div className="container">
          <div className="sectionHead">
            <div><div className="kicker">INDUSTRIES WE SERVE</div><h2>Built around the way industries move.</h2></div>
            <p>Purposeful logistics for demanding supply chains, from fast commerce to complex industrial cargo.</p>
          </div>
          <div className="industryGrid">
            {industries.map(([title, text], i) => (
              <article className="industryCard" key={title}>
                <span>0{i + 1}</span><h3>{title}</h3><p>{text}</p><a href="#contact">View capability →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="network" className="section networkSection">
        <div className="container networkWrap">
          <div className="networkCopy">
            <div className="kicker">GLOBAL REACH. LOCAL EXPERTISE.</div>
            <h2>Connecting markets across continents.</h2>
            <p>KAS is headquartered in Riyadh with a network across Saudi Arabia, the UAE and key African markets including Kenya, South Africa, Namibia, Sudan and Rwanda.</p>
            <div className="networkBullets">
              <span>Saudi Arabia</span><span>UAE</span><span>Kenya</span><span>South Africa</span><span>Namibia</span><span>Sudan</span><span>Rwanda</span>
            </div>
            <a className="primaryBtn inlineBtn" href="#contact">Explore Our Network →</a>
          </div>
          <div className="networkMap">
            <div className="mapGrid"></div>
            <div className="mapWorld">WORLD</div>
            <div className="mapNode n1">RIYADH</div>
            <div className="mapNode n2">UAE</div>
            <div className="mapNode n3">KENYA</div>
            <div className="mapNode n4">S. AFRICA</div>
            <div className="mapNode n5">RWANDA</div>
            <svg viewBox="0 0 600 360" preserveAspectRatio="none">
              <path d="M355 112 C300 105 260 145 235 178 S180 235 130 252" />
              <path d="M355 112 C390 140 405 175 395 225 S390 275 355 300" />
              <path d="M355 112 C410 105 470 130 525 160" />
              <path d="M355 112 C315 160 300 190 300 225" />
            </svg>
          </div>
        </div>
      </section>

      <section id="digital" className="section digitalSection">
        <div className="container digitalGrid">
          <div>
            <div className="kicker">DIGITAL LOGISTICS</div>
            <h2>Smarter logistics through technology.</h2>
            <p>Give your team one operational view across shipments, quotations, documents, customer visibility and workflow.</p>
            <div className="digitalList">
              <div><b>Live Tracking</b><span>Shipment milestones and visibility</span></div>
              <div><b>Digital Quote</b><span>Structured rate requests and workflows</span></div>
              <div><b>CRM & Operations</b><span>Connected customer and operational data</span></div>
              <div><b>Automated Invoicing</b><span>Reduce manual administration</span></div>
            </div>
          </div>
          <div className="dashboard">
            <div className="dashTop"><b>KAS CONTROL TOWER</b><span>● SYSTEM ONLINE</span></div>
            <div className="dashCards"><div><small>ACTIVE</small><strong>LIVE</strong></div><div><small>ROUTES</small><strong>07</strong></div><div><small>STATUS</small><strong>98%</strong></div></div>
            <div className="dashChart"><div className="chartLine"></div><div className="chartLine second"></div><span>VISIBILITY / TIME</span></div>
            <div className="dashRows"><div><span>Origin gateway</span><b>Confirmed</b></div><div><span>In transit</span><b>Live</b></div><div><span>Destination</span><b>Scheduled</b></div></div>
          </div>
        </div>
      </section>

      <section id="about" className="section aboutSection">
        <div className="container aboutGrid">
          <div><div className="kicker">KAS LOGISTICS SERVICES</div><h2>Your cargo. Our commitment.</h2></div>
          <div><p>Founded in 2023 and headquartered in Riyadh, KAS is built to connect global supply chains with the Middle East and Africa through reliable, efficient and increasingly digital logistics solutions.</p><a className="ghostBtn darkText" href="#contact">About KAS →</a></div>
        </div>
      </section>

      <section id="contact" className="section ctaSection">
        <div className="container cta">
          <div><div className="kicker light">YOUR CARGO. OUR COMMITMENT.</div><h2>Ready to move what moves your business?</h2></div>
          <div><p>Tell KAS where your cargo starts, where it needs to go and what matters most.</p><button className="whiteBtn" onClick={() => setQuoteOpen(true)}>Get a Quote →</button></div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footerGrid">
          <div><img src="/kas-logo.png" alt="KAS Logistics Services" /><p>Connected logistics across the Middle East, Africa and global supply chains.</p><p>info@kaslogistic.com<br/>sales@kaslogistic.com</p></div>
          <div><b>SOLUTIONS</b><a href="#services">Air Freight</a><a href="#services">Sea Freight</a><a href="#services">Land Freight</a><a href="#services">Warehousing</a></div>
          <div><b>DIGITAL</b><a href="#digital">Control Tower</a><a href="#tracking">Tracking</a><a href="#digital">Digital Quote</a><a href="#digital">Operations</a></div>
          <div><b>COMPANY</b><a href="#about">About KAS</a><a href="#network">Network</a><a href="#contact">Contact</a><a href="#top">Back to top ↑</a></div>
        </div>
        <div className="container footerBottom"><span>© KAS Logistics Services</span><span>Riyadh, Saudi Arabia</span></div>
      </footer>

      {quoteOpen && (
  <div
    className="modalBackdrop"
    onClick={() => setQuoteOpen(false)}
  >
    <div
      className="quoteModal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="closeModal"
        onClick={() => {
          setQuoteOpen(false);
          setQuoteStep(1);
        }}
      >
        ×
      </button>

      <div className="kicker">KAS QUOTE</div>

      <div className="quoteProgress">
        <span className={quoteStep >= 1 ? "active" : ""}>01</span>
        <i />
        <span className={quoteStep >= 2 ? "active" : ""}>02</span>
        <i />
        <span className={quoteStep >= 3 ? "active" : ""}>03</span>
        <i />
        <span className={quoteStep >= 4 ? "active" : ""}>04</span>
      </div>

      {quoteStep === 1 && (
        <>
          <h2>Tell us what needs to move.</h2>
          <p className="quoteIntro">
            Start with the route and shipment type. We will take it from there.
          </p>

          <div className="formGrid">
            <label>
              Origin
              <input
                value={quoteData.origin}
                onChange={(e) => updateQuote("origin", e.target.value)}
                placeholder="Riyadh / Dubai / Shanghai..."
              />
            </label>

            <label>
              Destination
              <input
                value={quoteData.destination}
                onChange={(e) =>
                  updateQuote("destination", e.target.value)
                }
                placeholder="Jeddah / Nairobi / Johannesburg..."
              />
            </label>

            <label>
              Service
              <select
                value={quoteData.service}
                onChange={(e) => updateQuote("service", e.target.value)}
              >
                <option>Air Freight</option>
                <option>Sea Freight</option>
                <option>Land Freight</option>
                <option>Warehousing</option>
                <option>Project Logistics</option>
              </select>
            </label>

            <label>
              Cargo type
              <select
                value={quoteData.cargoType}
                onChange={(e) =>
                  updateQuote("cargoType", e.target.value)
                }
              >
                <option>General Cargo</option>
                <option>Dangerous Goods</option>
                <option>Pharmaceuticals</option>
                <option>Perishables</option>
                <option>Valuables</option>
                <option>Oversized / Project Cargo</option>
              </select>
            </label>
          </div>

                    <button
            type="button"
            className="primaryBtn fullBtn"
            onClick={nextQuoteStep}
          >
            Continue →
          </button>
        </>
      )}

      {quoteStep === 2 && (
        <>
          <h2>Cargo details.</h2>
          <p className="quoteIntro">
            Give us the key shipment details so our team can assess the move.
          </p>

          <div className="formGrid">
            <label>
              Weight
              <input
                value={quoteData.weight}
                onChange={(e) => updateQuote("weight", e.target.value)}
                placeholder="e.g. 500 kg"
              />
            </label>

            <label>
              Quantity
              <input
                value={quoteData.quantity}
                onChange={(e) => updateQuote("quantity", e.target.value)}
                placeholder="e.g. 12 cartons"
              />
            </label>

            <label>
              Dimensions
              <input
                value={quoteData.dimensions}
                onChange={(e) =>
                  updateQuote("dimensions", e.target.value)
                }
                placeholder="L × W × H"
              />
            </label>

            <label>
              Pickup date
              <input
                type="date"
                value={quoteData.pickupDate}
                onChange={(e) =>
                  updateQuote("pickupDate", e.target.value)
                }
              />
            </label>

            <label className="fullField">
              Special requirements
              <textarea
                value={quoteData.requirements}
                onChange={(e) =>
                  updateQuote("requirements", e.target.value)
                }
                placeholder="Temperature control, fragile cargo, DG requirements..."
              />
            </label>
          </div>

          <div className="quoteActions">
            <button
              className="ghostBtn"
              onClick={previousQuoteStep}
            >
              ← Back
            </button>

                        <button
              type="button"
              className="primaryBtn"
              onClick={nextQuoteStep}
            >
              Continue →
            </button>
          </div>
        </>
      )}

      {quoteStep === 3 && (
        <>
          <h2>Your contact details.</h2>
          <p className="quoteIntro">
            Tell us who we should contact regarding your shipment.
          </p>

          <div className="formGrid">
            <label>
              Company
              <input
                value={quoteData.company}
                onChange={(e) => updateQuote("company", e.target.value)}
                placeholder="Company name"
              />
            </label>

            <label>
              Name
              <input
                value={quoteData.name}
                onChange={(e) => updateQuote("name", e.target.value)}
                placeholder="Full name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={quoteData.email}
                onChange={(e) => updateQuote("email", e.target.value)}
                placeholder="name@company.com"
              />
            </label>

            <label>
              Phone / WhatsApp
              <input
                value={quoteData.phone}
                onChange={(e) => updateQuote("phone", e.target.value)}
                placeholder="+966..."
              />
            </label>

            <label className="fullField">
              Additional notes
              <textarea
                value={quoteData.notes}
                onChange={(e) => updateQuote("notes", e.target.value)}
                placeholder="Anything else our team should know?"
              />
            </label>
          </div>

          <div className="quoteActions">
            <button
              className="ghostBtn"
              onClick={previousQuoteStep}
            >
              ← Back
            </button>

                        <button
              type="button"
              className="primaryBtn"
              onClick={submitQuote}
              disabled={quoteSubmitting}
            >
              {quoteSubmitting ? "Sending…" : "Request a Quote →"}
            </button>
          </div>
        </>
      )}

      {quoteStep === 4 && (
        <div className="quoteSuccess">
          <div className="successMark">✓</div>

          <h2>Quote request received.</h2>

          <p>
            Thank you for choosing KAS Logistics. Our team will review
            your shipment details and contact you shortly.
          </p>

          <div className="quoteSummary">
            <div>
              <span>Route</span>
              <strong>
                {quoteData.origin || "—"} → {quoteData.destination || "—"}
              </strong>
            </div>

            <div>
              <span>Service</span>
              <strong>{quoteData.service}</strong>
            </div>

            <div>
              <span>Cargo</span>
              <strong>{quoteData.cargoType}</strong>
            </div>
          </div>

          <button
            className="primaryBtn fullBtn"
            onClick={() => {
              setQuoteOpen(false);
              setQuoteStep(1);
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  </div>
)}
        
</main>
);
}
