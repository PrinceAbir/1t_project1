export default [
  {
    
    application: "payment",
    type: "core",
    record: {
      id: "FT2024001",
      transaction_type: ["TT01", "TT05"],
      debit_account: 1234567890,
      credit_account: 9876543210,
      debit_currency: 123,
      credit_currency: 456,
      debit_amount: 50000,
      debit_value_date: "2024-01-20",
      ordering_customer: "John Doe",
      beneficiary: "Alice Rahman",
      customer_reference: "REF-20240120-001",
      address: [
        "House 12, Road 5, Dhanmondi",
        "Dhaka, Bangladesh"
      ],
      priority: "NORMAL",
      delivery_channel: "BRANCH",
      tax: 500
    }
  },
  {
   
    application: "payment",
    type: "core",
    record: {
       id: "FT2024002",
      transaction_type: ["TT02"],
      debit_account: 1111111111,
      credit_account: 2222222222,
      debit_currency: 123,
      credit_currency: 123,
      debit_amount: 100000,
      debit_value_date: "2024-01-21",
      ordering_customer: "Global Enterprises Ltd",
      beneficiary: "Tech Solutions",
      customer_reference: "REF-20240121-002",
      address: [
        "Industrial Area Block-5",
        "Gazipur, Bangladesh"
      ],
      priority: "HIGH",
      delivery_channel: "BRANCH",
      charge_account: 3333333333,
      charge_code: "CHARGE01",
      email_notification: "contact@globalent.com"
    }
  },
  {
    
    application: "payment",
    type: "core",
    record: {
      id: "FT2024003",
      transaction_type: ["TT03", "TT04"],
      debit_account: 5555555555,
      credit_account: 6666666666,
      debit_currency: 840,
      credit_currency: 840,
      debit_amount: 25000,
      debit_value_date: "2024-01-22",
      ordering_customer: "Alice Rahman",
      beneficiary: "International Medical Services",
      customer_reference: "REF-20240122-003",
      payment_details: "Medical treatment bills - Invoice #MED2024001",
      address: [
        "456 Hospital Road",
        "Chittagong, Bangladesh"
      ],
      priority: "NORMAL",
      delivery_channel: "ONLINE",
      beneficiary_address: "New York, USA",
      beneficiary_bank: "Bank of America",
      intermediary_bank: "SWIFT Network",
      exchange_rate: 110.5,
      sms_notification: ["+88801887654321"],
      email_notification: "alice.rahman@email.com"
    }
  },
  {
   
    application: "payment",
    type: "core",
    record: {
       id: "FT2024004",
      transaction_type: ["TT01"],
      debit_account: 7777777777,
      credit_account: 8888888888,
      debit_currency: 123,
      credit_currency: 123,
      debit_amount: 75000,
      debit_value_date: "2024-01-23",
      ordering_customer: "Corporate Account",
      beneficiary: "Salary Distribution",
      customer_reference: "REF-20240123-004",
      payment_details: "Monthly salary disbursement - Jan 2024",
      address: [
        "123 Business Park",
        "Dhaka, Bangladesh"
      ],
      priority: "NORMAL",
      delivery_channel: "BATCH",
      narrative: "Regular monthly payroll transaction",
      commission: 500,
      tax: 1000,
      transaction_charges: 250
    }
  },
  {
   
    application: "payment",
    type: "core",
    record: {
       id: "FT2024005",
      transaction_type: ["TT05"],
      debit_account: 9999999999,
      credit_account: 1010101010,
      debit_currency: 840,
      credit_currency: 156,
      debit_amount: 150000,
      debit_value_date: "2024-01-24",
      ordering_customer: "Trade Company Ltd",
      beneficiary: "Export Partners International",
      customer_reference: "REF-20240124-005",
      payment_details: "Payment for imported goods - PO#IMP2024001",
      address: [
        "Port Area, Zone 1",
        "Chattogram Port, Bangladesh"
      ],
      priority: "HIGH",
      delivery_channel: "SWIFT",
      beneficiary_address: "Shanghai, China",
      beneficiary_bank: "Industrial and Commercial Bank of China",
      exchange_rate: 10.25,
      commission: 1500,
      tax: 3000
    }
  }
];

