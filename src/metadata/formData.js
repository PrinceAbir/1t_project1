// metadata/t24FTMetadata.js
const t24FTMetadata = {
  form_name: "fund_transfer_form",
  transaction_type: "FT",
  version: "T24.10",
  fields: [
    {
      name: "transaction_type",
      label: "Transaction Type",
      type: "select",
      options: ["FT", "AC", "LD", "CO", "CH"],
      required: true,
      multi: false,
      dropdown: true,
      t24_field: "TRANSACTION.TYPE"
    },
    {
      name: "debit_account",
      label: "Debit Account",
      type: "account",
      required: true,
      multi: false,
      dropdown: true,
      dropdownType: "dynamic",
      dropdownName: "ACCOUNT",
      hotfield: true,
      t24_field: "DEBIT.ACCT.NO"
    },
    {
      name: "credit_account",
      label: "Credit Account",
      type: "account",
      required: true,
      multi: false,
      dropdown: true,
      dropdownType: "dynamic",
      dropdownName: "ACCOUNT",
      hotfield: true,
      t24_field: "CREDIT.ACCT.NO"
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      options: ["USD", "EUR", "GBP", "JPY", "INR"],
      required: true,
      multi: false,
      t24_field: "CURRENCY"
    },
    {
      name: "amount",
      label: "Amount",
      type: "amount",
      min: 1,
      max: 1000000000,
      required: true,
      multi: false,
      hotfield: true,
      decimals: 2,
      t24_field: "AMOUNT"
    },
    {
      name: "value_date",
      label: "Value Date",
      type: "date",
      required: true,
      multi: false,
      t24_field: "VALUE.DATE"
    },
    {
      name: "payment_details",
      label: "Payment Details",
      type: "textarea",
      required: false,
      multi: false,
      maxLength: 200,
      t24_field: "PAYMENT.DETAILS"
    },
    {
      name: "charge_account",
      label: "Charge Account",
      type: "account",
      required: false,
      multi: false,
      dropdown: true,
      dropdownType: "dynamic",
      dropdownName: "ACCOUNT",
      t24_field: "CHARGE.ACCOUNT"
    },
    {
      name: "charge_code",
      label: "Charge Code",
      type: "select",
      options: ["OUR", "BEN", "SHA"],
      required: false,
      multi: false,
      t24_field: "CHARGE.CODE"
    },
    {
      name: "ordering_customer",
      label: "Ordering Customer",
      type: "string",
      min: 5,
      max: 100,
      required: true,
      multi: false,
      t24_field: "ORDERING.CUSTOMER"
    },
    {
      name: "beneficiary",
      label: "Beneficiary",
      type: "string",
      min: 5,
      max: 100,
      required: true,
      multi: false,
      t24_field: "BENEFICIARY"
    },
    {
      name: "beneficiary_address",
      label: "Beneficiary Address",
      type: "textarea",
      required: false,
      multi: false,
      maxLength: 150,
      t24_field: "BENEFICIARY.ADDRESS"
    },
    {
      name: "beneficiary_bank",
      label: "Beneficiary Bank",
      type: "string",
      min: 5,
      max: 100,
      required: false,
      multi: false,
      t24_field: "BENEFICIARY.BANK"
    },
    {
      name: "intermediary_bank",
      label: "Intermediary Bank",
      type: "string",
      required: false,
      multi: false,
      t24_field: "INTERMEDIARY.BANK"
    },
    {
      name: "customer_reference",
      label: "Customer Reference",
      type: "reference",
      required: true,
      multi: false,
      pattern: "^[A-Z0-9]{1,20}$",
      t24_field: "CUSTOMER.REF"
    },
    {
      name: "internal_reference",
      label: "Internal Reference",
      type: "reference",
      required: false,
      multi: false,
      readOnly: true,
      t24_field: "INTERNAL.REF"
    },
    {
      name: "exchange_rate",
      label: "Exchange Rate",
      type: "number",
      min: 0.0001,
      max: 10000,
      required: false,
      multi: false,
      decimals: 4,
      t24_field: "EXCHANGE.RATE"
    },
    {
      name: "commission",
      label: "Commission",
      type: "amount",
      required: false,
      multi: false,
      decimals: 2,
      t24_field: "COMMISSION"
    },
    {
      name: "tax",
      label: "Tax",
      type: "amount",
      required: false,
      multi: false,
      decimals: 2,
      t24_field: "TAX"
    },
    {
      name: "transaction_charges",
      label: "Transaction Charges",
      type: "amount",
      required: false,
      multi: false,
      decimals: 2,
      t24_field: "TRANSACTION.CHARGES"
    },
    {
      name: "narrative",
      label: "Narrative",
      type: "textarea",
      required: false,
      multi: false,
      maxLength: 250,
      t24_field: "NARRATIVE"
    },
    {
      name: "email_notification",
      label: "Email ",
      type: "email",
      required: false,
      multi: true,
      max_multifield: 5,
      t24_field: "EMAIL.NOTIFICATION"
    },
    {
      name: "sms_notification",
      label: "SMS Notification",
      type: "tel",
      required: false,
      multi: true,
      max_multifield: 3,
      t24_field: "SMS.NOTIFICATION"
    },
    {
      name: "attachment",
      label: "Attachment",
      type: "file",
      required: false,
      multi: false,
      accept: ".pdf,.doc,.docx,.jpg,.png",
      t24_field: "ATTACHMENT"
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: ["NORMAL", "HIGH", "URGENT"],
      required: true,
      multi: false,
      defaultValue: "NORMAL",
      t24_field: "PRIORITY"
    },
    {
      name: "delivery_channel",
      label: "Delivery Channel",
      type: "select",
      options: ["RTGS", "NEFT", "SWIFT", "CHIPS", "FEDWIRE"],
      required: true,
      multi: false,
      t24_field: "DELIVERY.CHANNEL"
    }
  ]
};

export default t24FTMetadata;