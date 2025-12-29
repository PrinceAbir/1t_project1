const etdDropdownValues = {
  /* ================= PRODUCT ================= */
  product: [
    { id: "AA", description: "ARRANGEMENT ARCHITECTURE", component: "Retail", productGroup: "Retail", moduleUpgrade: "" },
    { id: "AAPRIC", description: "Pricing Grids", component: "", productGroup: "", moduleUpgrade: "" },
    { id: "AASUBS", description: "Subscriptions Plan Product", component: "", productGroup: "", moduleUpgrade: "" },
    { id: "AB", description: "ARRANGEMENT BUNDLE", component: "Retail", productGroup: "Retail", moduleUpgrade: "" },
    { id: "AC", description: "Accounts", component: "BankingFramework", productGroup: "BankingFramework", moduleUpgrade: "" }
  ],

  /* ================= DATA TYPES ================= */
  dataType: [
    { code: "AAPRODUCT", description: "AA Products", valProg: "IN2AAPRODUCT", maxChar: 35 },
    { code: "ACCOUNT", description: "Account Type", valProg: "IN2ANT", maxChar: 19 },
    { code: "ALPHA", description: "Alpha Characters", valProg: "IN2AAA", maxChar: 35 }
  ],

  /* ================= FILE TYPE ================= */
  fileType: [
    { code: "CUS", name: "Customer" },
    { code: "FIN", name: "Financial" },
    { code: "FTD", name: "Fund Transfer" },
    { code: "INT", name: "Internal" }
  ],

  /* ================= NS OPERATION ================= */
  nsOperation: [
    { code: "ALL", name: "All" },
    { code: "NEW.NOD", name: "New Nod" }
  ],

  /* ================= ADD SPECIAL FIELDS ================= */
  addSpecialFields: [
    { code: "XX.DELIVERY.REF", name: "Xx.delivery.ref" },
    { code: "XX.LOCAL.REF", name: "Xx.local.ref" },
    { code: "XX.STMT.NO", name: "Xx.stmt.no" }
  ],

  /* ================= PROGRAM TYPE ================= */
  pgmType: [
    { code: "", name: "Default (No Selection)" },
    { code: "L", name: "L" },
    { code: "U", name: "U" }
  ],

  /* ================= ACTIVITY ================= */
  activity: [
    { code: "ACT001", name: "Activity 1" },
    { code: "ACT002", name: "Activity 2" }
  ],

  /* ================= FIELD PROPERTY ================= */
  fieldProperty: [
    { code: "FP001", name: "Mandatory" },
    { code: "FP002", name: "Optional" }
  ],

  /* ================= SUB ASSOC ================= */
  subAssoc: [
    { code: "SUB001", name: "SubAssoc 1" },
    { code: "SUB002", name: "SubAssoc 2" }
  ],

  /* ================= FLD PRODUCT ================= */
  fldProduct: [
    { code: "FPD001", name: "Fld Product 1" },
    { code: "FPD002", name: "Fld Product 2" }
  ],

  /* ================= FIELD OWNER ================= */
  fieldOwner: [
    { code: "FO001", name: "Owner 1" },
    { code: "FO002", name: "Owner 2" }
  ],

  /* ================= YES/NO ================= */
  yesNo: [
    { code: "Y", name: "Yes" },
    { code: "N", name: "No" }
  ],

  /* ================= ATTRIBUTES ================= */
  attributes: [
    { code: "ATTR001", name: "Attribute 1" },
    { code: "ATTR002", name: "Attribute 2" }
  ],

  /* ================= PURPOSE ================= */
  purpose: [
    { code: "PUR001", name: "Purpose 1" },
    { code: "PUR002", name: "Purpose 2" }
  ],

  /* ================= ERASE OPTION ================= */
  eraseOption: [
    { code: "EO001", name: "Erase Option 1" },
    { code: "EO002", name: "Erase Option 2" }
  ],

  /* ================= ACCESSIBILITY ================= */
  accessibility: [
    { code: "ACC001", name: "Accessibility 1" },
    { code: "ACC002", name: "Accessibility 2" }
  ],

  /* ================= CLASS TYPE ================= */
  classType: [
    { code: "CL001", name: "Class Type 1" },
    { code: "CL002", name: "Class Type 2" }
  ],

  /* ================= TABLE OWNER ================= */
  tableOwner: [
    { code: "TO001", name: "Owner 1" },
    { code: "TO002", name: "Owner 2" }
  ]
};

export default etdDropdownValues;
