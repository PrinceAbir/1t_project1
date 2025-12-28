const customerMetaData = {
  "application": "customer",
  "type": "core",
  "fields": {
    "customer.name.1": {
      "field_name": "customer_name_1",
      "label": "Customer Name 1",
      "type": "string",
      "multivalued": true,
      "mandatory": true,
      "min_length": 2,
      "max_length": 100,
      "max_multifield": 3
    },
    "customer.name.2": {
      "field_name": "customer_name_2",
      "label": "Customer Name 2",
      "type": "string",
      "multivalued": false,
      "mandatory": false,
      "max_length": 100
    },
    "short.name": {
      "field_name": "short_name",
      "label": "Short Name",
      "type": "string",
      "multivalued": false,
      "mandatory": true,
      "min_length": 2,
      "max_length": 35
    },
    "mnemonic": {
      "field_name": "mnemonic",
      "label": "Mnemonic",
      "type": "string",
      "multivalued": false,
      "mandatory": true
    },
    "street": {
      "field_name": "street",
      "label": "Street",
      "type": "string",
      "multivalued": false,
      "mandatory": false
    },
    "address.line.1": {
      "field_name": "address_line_1",
      "label": "Address 1",
      "type": "string",
      "multivalued": false,
      "mandatory": false
    },
    "town.city": {
      "field_name": "town_city",
      "label": "Town Country",
      "type": "string",
      "multivalued": false,
      "mandatory": false
    },
    "postal.code": {
      "field_name": "postal_code",
      "label": "Post Code",
      "type": "string",
      "multivalued": false,
      "mandatory": false
    },
    "country": {
      "field_name": "country",
      "label": "Country",
      "type": "dropdown",
      "dropdown": {
        "source": "country",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "sector": {
      "field_name": "sector",
      "label": "Sector",
      "type": "dropdown",
      "dropdown": {
        "source": "sector",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "account.officer": {
      "field_name": "account_officer",
      "label": "Account Officer",
      "type": "dropdown",
      "dropdown": {
        "source": "accountOfficer",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "other.officer.1": {
      "field_name": "other_officer_1",
      "label": "Other Officer 1",
      "type": "dropdown",
      "dropdown": {
        "source": "accountOfficer",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "industry": {
      "field_name": "industry",
      "label": "Industry",
      "type": "dropdown",
      "dropdown": {
        "source": "industry",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "target": {
      "field_name": "target",
      "label": "Target",
      "type": "string",
      "multivalued": false,
      "mandatory": false
    },
    "nationality": {
      "field_name": "nationality",
      "label": "Nationality",
      "type": "dropdown",
      "dropdown": {
        "source": "nationality",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": true
    },
    "customer.status": {
      "field_name": "customer_status",
      "label": "Customer Status",
      "type": "dropdown",
      "dropdown": {
        "source": "customerStatus",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "residence": {
      "field_name": "residence",
      "label": "Residence",
      "type": "dropdown",
      "dropdown": {
        "source": "residence",
        "type": "application",
        "selecttion": "SELECT customer WHERE description CONTAINS ''"
      },
      "multivalued": false,
      "mandatory": false
    },
    "contact.date": {
      "field_name": "contact_date",
      "label": "Contact Date",
      "type": "date",
      "multivalued": true,
      "mandatory": false
    },
    "dob.incorp": {
      "field_name": "dob_incorp",
      "label": "Birth Incorp Date",
      "type": "date",
      "multivalued": false,
      "mandatory": false
    }
  }
}

export default customerMetaData;
