// DummyDropdownData.js
const dummyData = {
  sector: [
    { id: 1000, description: "Individuals" },
    { id: 1001, description: "Staff" },
    { id: 1002, description: "Director" },
    { id: 1003, description: "Corporate" },
    { id: 1004, description: "SME" }
  ],
  industry: [
    { code: "IT", name: "Technology" },
    { code: "FIN", name: "Finance" },
    { code: "HLTH", name: "Healthcare" },
    { code: "EDU", name: "Education" },
    { code: "ENG", name: "Engineering" }
  ],
  nationality: [
    { code: "US", name: "United States" },
    { code: "UK", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "IN", name: "India" }
  ],
  customerStatus: [
    { code: "ACTIVE", name: "Active" },
    { code: "INACTIVE", name: "Inactive" },
    { code: "PENDING", name: "Pending" },
    { code: "CLOSED", name: "Closed" }
  ],
  residence: [
    { code: "LOCAL", name: "Local" },
    { code: "FOREIGN", name: "Foreign" },
    { code: "EXPAT", name: "Expatriate" }
  ],
  accountOfficer: [
    { userId: "U01", firstName: "John", lastName: "Doe" },
    { userId: "U02", firstName: "Jane", lastName: "Smith" },
    { userId: "U03", firstName: "Alice", lastName: "Brown" },
    { userId: "U04", firstName: "Bob", lastName: "Johnson" }
  ],
  otherOfficer1: [
    { userId: "U05", firstName: "Michael", lastName: "Lee" },
    { userId: "U06", firstName: "Sara", lastName: "Wilson" },
    { userId: "U07", firstName: "David", lastName: "Kim" }
  ]
};

export default dummyData;
