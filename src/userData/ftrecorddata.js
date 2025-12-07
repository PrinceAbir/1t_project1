export default {
  application: "payment",
  type: "core",
  record: {
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
    delivery_channel: "BRANCH"
  }
};
