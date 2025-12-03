import React, { useState } from 'react';
import './Homepage.css';
import CustomerPage from './components/CustomerPage';
import FundTransferPage from './components/FundTransferPage';
import AccountPage from './components/AccountPage';
import DepositPage from './components/DepositPage';
import LendingPage from './components/LendingPage';

const PAGES = [
  { id: 'customer', title: 'Customer', desc: 'Manage customers, profiles and KYC.' },
  { id: 'funds', title: 'Fund Transfer', desc: 'Create and manage transfers.' },
  { id: 'account', title: 'Account', desc: 'Account opening and maintenance.' },
  { id: 'deposit', title: 'Deposit', desc: 'Create deposit products and placements.' },
  { id: 'lending', title: 'Lending', desc: 'Loan origination and servicing.' }
];

const Homepage = () => {
  const [active, setActive] = useState(null);

  const renderActive = () => {
    switch (active) {
      case 'customer':
        return <CustomerPage />;
      case 'funds':
        return <FundTransferPage />;
      case 'account':
        return <AccountPage />;
      case 'deposit':
        return <DepositPage />;
      case 'lending':
        return <LendingPage />;
      default:
        return (
          <div className="hp-grid">
            {PAGES.map(p => (
              <div key={p.id} className="hp-card" onClick={() => setActive(p.id)}>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="homepage">
      <div className="hp-header">
        <div className="hp-title">T24 Transact - Home</div>
        <div className="hp-actions">
          {active && (
            <button className="back-button" onClick={() => setActive(null)}>Back</button>
          )}
        </div>
      </div>

      {renderActive()}
    </div>
  );
};

export default Homepage;
