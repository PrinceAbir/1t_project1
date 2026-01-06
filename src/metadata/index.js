import fundTransferMeta from "./fundTransferMeta";
import customerMeta from "./customerMetaData";

import accountMeta from './accountMetaData';       // ← Add these when you have them
import depositMeta from './depositMetaData';
import lendingMeta from './lendingMetaData';

const coreApplications = {
  CUSTOMER: customerMeta,
  "FUND.TRANSFER": fundTransferMeta,
  ACCOUNT: accountMeta,
  DEPOSIT: depositMeta,
  LENDING: lendingMeta,
};

// Validation
Object.keys(coreApplications).forEach(key => {
  const meta = coreApplications[key];
  if (meta && meta.application !== key) {
    console.warn(`[Metadata Warning] Expected "${key}" but got "${meta.application}"`);
  }
});

export const getMetadata = (appName) => {
  const key = appName.trim().toUpperCase().replace(' ', '.');
  return coreApplications[key] || null;
};

// ← ADD THIS FUNCTION
export const getAllApplications = () => {
  return Object.keys(coreApplications).map(key => {
    const meta = coreApplications[key];
    return {
      name: key,                                    // e.g., "CUSTOMER"
      displayName: key.replace('.', ' '),           // e.g., "FUND TRANSFER"
      description: meta.description || `Core application: ${key.replace('.', ' ')}`,
      icon: getIconForApp(key),
      color: getColorForApp(key),
      fieldCount: meta.fields ? Object.keys(meta.fields).length : 0,
      type: 'Core',
    };
  });
};

// Helper icons and colors
const getIconForApp = (app) => {
  const icons = {
    CUSTOMER: '👤',
    "FUND.TRANSFER": '💸',
    ACCOUNT: '🏦',
    DEPOSIT: '💰',
    LENDING: '📈',
  };
  return icons[app] || '📁';
};

const getColorForApp = (app) => {
  const colors = {
    CUSTOMER: '#667eea',
    "FUND.TRANSFER": '#48bb78',
    ACCOUNT: '#ed8936',
    DEPOSIT: '#9f7aea',
    LENDING: '#4299e1',
  };
  return colors[app] || '#4f46e5';
};

export default coreApplications;