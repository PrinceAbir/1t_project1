import React, { useState } from "react";
import "./Homepage.css";
import T24TransactExplorer from "./components/T24TransactExplorer";

const PAGES = [
  { id: "customer", title: "Customer", desc: "Manage customers, profiles and KYC." },
  { id: "funds", title: "Fund Transfer", desc: "Create and manage transfers." },
  { id: "account", title: "Account", desc: "Account opening and maintenance." },
  { id: "deposit", title: "Deposit", desc: "Create deposit products and placements." },
  { id: "lending", title: "Lending", desc: "Loan origination and servicing." }
];

const Homepage = () => {
  const [active, setActive] = useState(null);

  return (
    <div className="homepage">
      {/* Header */}
      <div className="hp-header">
        <div className="hp-title">T24 Transact - Home</div>

        {active && (
          <button className="back-button" onClick={() => setActive(null)}>
            Back
          </button>
        )}
      </div>

      {/* Grid OR Explorer */}
      {!active ? (
        <div className="hp-grid">
          {PAGES.map((p) => (
            <div key={p.id} className="hp-card" onClick={() => setActive(p.id)}>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <T24TransactExplorer module={active} />
      )}
    </div>
  );
};

export default Homepage;
