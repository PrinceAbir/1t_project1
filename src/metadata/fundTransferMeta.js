// src/metadata/fundTransferMeta.js
const fundTransferMeta = {
  "application": "payment",
  "type": "core",
  "columns":2,
  "fields": {
    "transaction_type": {
      "field_name": "transaction_type",
      "label": "Transaction Type",
      "type": "select",
      "options": ["Internal Trans fer", "External Transfer", "International Transfer"],
      "multi": true,
      "mandatory": true,
      "max_multifield": 3
    },
    "debit_account": {
      "field_name": "debit_account",
      "label": "Debit Account",
      "type": "int",
      "multi": false,
      "mandatory": true
    },
    "credit_account": {
      "field_name": "credit_account",
      "label": "Credit Account",
      "type": "int",
      "multi": false,
      "mandatory": true
    },
    "debit_currency": {
      "field_name": "debit_currency",
      "label": "Debit Currency",
      "type": "select",
      "multi": false,
      "mandatory": true,
      "options": [123, 456] // Fixed typo from "oppotions"
    },
    "credit_currency": {
      "field_name": "credit_currency",
      "label": "Credit Currency",
      "type": "select",
      "multi": false,
      "mandatory": true
    },
    "debit_amount": {
      "field_name": "debit_amount",
      "label": "Debit Amount",
      "type": "amount",
      "multi": false,
      "mandatory": true,
      "min_length": 1,
      "max_length": 1000000000
    },
    "debit_value_date": {
      "field_name": "debit_value_date",
      "label": "Debit Value Date",
      "type": "date",
      "multi": false,
      "mandatory": true
    },
    "payment_details": {
      "field_name": "payment_details",
      "label": "Payment Details",
      "type": "textarea",
      "multi": false,
      "mandatory": false,
      "max_length": 200
    },
    "charge_account": {
      "field_name": "charge_account",
      "label": "Charge Account",
      "type": "account",
      "multi": false,
      "mandatory": false
    },
    "charge_code": {
      "field_name": "charge_code",
      "label": "Charge Code",
      "type": "select",
      "multi": false,
      "mandatory": false
    },
    "ordering_customer": {
      "field_name": "ordering_customer",
      "label": "Ordering Customer",
      "type": "string",
      "multi": false,
      "mandatory": true,
      "min_length": 5,
      "max_length": 100
    },
    "beneficiary": {
      "field_name": "beneficiary",
      "label": "Beneficiary",
      "type": "string",
      "multi": false,
      "mandatory": true,
      "min_length": 5,
      "max_length": 100
    },
    "beneficiary_address": {
      "field_name": "beneficiary_address",
      "label": "Beneficiary Address",
      "type": "textarea",
      "multi": false,
      "mandatory": false,
      "max_length": 150
    },
    "beneficiary_bank": {
      "field_name": "beneficiary_bank",
      "label": "Beneficiary Bank",
      "type": "string",
      "multi": false,
      "mandatory": false,
      "min_length": 5,
      "max_length": 100
    },
    "intermediary_bank": {
      "field_name": "intermediary_bank",
      "label": "Intermediary Bank",
      "type": "string",
      "multi": false,
      "mandatory": false
    },
    "customer_reference": {
      "field_name": "customer_reference",
      "label": "Customer Reference",
      "type": "reference",
      "multi": false,
      "mandatory": true
    },
    "internal_reference": {
      "field_name": "internal_reference",
      "label": "Internal Reference",
      "type": "reference",
      "multi": false,
      "mandatory": false
    },
    "exchange_rate": {
      "field_name": "exchange_rate",
      "label": "Exchange Rate",
      "type": "int",
      "multi": false,
      "mandatory": false
    },
    "commission": {
      "field_name": "commission",
      "label": "Commission",
      "type": "amount",
      "multi": false,
      "mandatory": false
    },
    "tax": {
      "field_name": "tax",
      "label": "Tax",
      "type": "amount",
      "multi": false,
      "mandatory": false
    },
    "transaction_charges": {
      "field_name": "transaction_charges",
      "label": "Transaction Charges",
      "type": "amount",
      "multi": false,
      "mandatory": false
    },
    "narrative": {
      "field_name": "narrative",
      "label": "Narrative",
      "type": "textarea",
      "multi": false,
      "mandatory": false,
      "max_length": 250
    },
    "email_notification": {
      "field_name": "email_notification",
      "label": "Email",
      "type": "email",
      "multi": false,
      "mandatory": false
    },
    "sms_notification": {
      "field_name": "sms_notification",
      "label": "SMS Notification",
      "type": "tel",
      "multi": true,
      "mandatory": false,
      "max_multifield": 2
    },
    "contact": {
      "field_name": "contact",
      "label": "Contact",
      "type": "group",
      "multivalued": true,
      "mandatory": false,
      "max_multifield": 3,
      "fields": [
        {
          "field_name": "phone",
          "label": "Phone Number",
          "type": "tel",
          "mandatory": true
        },
        {
          "field_name": "email",
          "label": "Email",
          "type": "email",
          "mandatory": false
        }
      ]
    },
    "address": {
      "field_name": "address",
      "label": "Address",
      "type": "string",
      "multi": true,
      "mandatory": true,
      "max_multifield": 3 
    },
    "attachment": {
      "field_name": "attachment",
      "label": "Attachment",
      "type": "file",
      "multi": false,
      "mandatory": false,
      "max_file_size": 5242880
    },
    "priority": {
      "field_name": "priority",
      "label": "Priority",
      "type": "select",
      "multi": false,
      "mandatory": true
    },
    "delivery_channel": {
      "field_name": "delivery_channel",
      "label": "Delivery Channel",
      "type": "select",
      "multi": false,
      "mandatory": true
    }
  }
};

export default fundTransferMeta;
