const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const authenticateJWT = require("../middleware/autheticateJWT.js");
const authorizeRoles = require("../middleware/authorizeRoles.js");

const Item = require("../models/item"); //for dev

router.get("/pagination", authenticateJWT, itemController.pagination); ///params: items?page=2&pageSize=5
router.get("/id/:id", authenticateJWT, itemController.itemById); ///params: items?page=2&pageSize=5
router.put("/document/:id", authenticateJWT, itemController.updateInternalDocument); ///params: items?page=2&pageSize=5
router.get("/insertDocs", async (req, res) => {
  // Generate 20 documents
  const serviceDocuments = createServiceDocuments(20);

  // const result = await Item.updateMany(
  //   {},
  //   {
  //     $push: {
  //       History: {
  //         time: new Date().toISOString(),
  //         description: "Timeline event 3",
  //       },
  //     },
  //   }
  // );
  const result = await Item.updateMany(
    {}, // Empty filter matches all documents in the collection
    {
      $set: {
        "Internal Documentation": {
          document: "This is the test document content", // Set the document field for all documents
          // history: [{
          //   time: new Date().toISOString(), // Set current timestamp
          //   updatedBy: new ObjectId(userId), // Assuming userId is the ObjectId of the user making the update
          // }],
        },
      },
    }
  );


  // const result = await Item.insertMany(serviceDocuments);
  res.send(result);
});

module.exports = router;

// DEV:
// Function to generate random service documents for Mongoose schema
function createServiceDocuments(numDocs = 20) {
  const documents = [];

  // Helper function to generate random data
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function generateRandomDate() {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  const tags = [
    "OAuth2",
    "JWT",
    "REST",
    "GraphQL",
    "Scalable",
    "High Availability",
    "Low Latency",
  ];
  const languages = ["Python", "Java", "JavaScript", "Go"];
  const services = [
    "User Authentication API",
    "Payment API",
    "Notification Service",
    "Analytics Service",
  ];
  const repoUrls = [
    "https://github.com/org/service-api",
    "https://github.com/org/frontend-app",
  ];
  const products = ["Customer Portal", "Admin Dashboard", "Mobile App"];
  const channelTypes = ["Slack", "Email", "Phone"];

  for (let i = 0; i < numDocs; i++) {
    const serviceName = getRandomItem(services);
    const description = "Random description for " + serviceName;
    const repoUrl = getRandomItem(repoUrls);
    const product = getRandomItem(products);
    const version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(
      Math.random() * 10
    )}.${Math.floor(Math.random() * 10)}`;
    const lastUpdated = generateRandomDate();

    const contacts = [
      {
        name: "Jane Doe",
        role: "Tech Lead",
        email: "jane.doe@example.com",
        description: "Responsible for backend services",
      },
      {
        name: "John Smith",
        role: "Product Manager",
        email: "john.smith@example.com",
        description: "Manages feature development",
      },
    ];

    const entityTags = [
      {
        tag: getRandomItem(tags),
        description: "Sample description of " + serviceName,
      },
      { tag: getRandomItem(tags), description: "Another tag description" },
    ];

    const serviceAliases = [
      {
        alias: "AuthService",
        description: "Short name for authentication service",
      },
      { alias: "UserAuth", description: "Another reference name" },
    ];

    const infrastructureComponents = [
      {
        type: "Database",
        name: "UserDB",
        id: getRandomUUID(),
        description: "Stores user authentication data",
      },
      {
        type: "Cache",
        name: "Redis Cache",
        id: getRandomUUID(),
        description: "Handles session caching",
      },
    ];

    const serviceMaturityScores = [
      {
        metric: "Code Quality",
        score: Math.floor(Math.random() * 20) + 75,
        description: "Static analysis results",
      },
      {
        metric: "Security",
        score: Math.floor(Math.random() * 20) + 80,
        description: "Vulnerability scans",
      },
    ];

    const externalDocumentation = [
      {
        title: "API Docs",
        url: "https://docs.example.com/service-api-docs",
        description: "Comprehensive API documentation",
      },
    ];

    const relatedRepos = [
      {
        name: "Frontend App",
        url: "https://github.com/fakeorg/frontend-app",
        description: "The front-end application that consumes this API",
      },
    ];

    const supportChannels = [
      {
        type: getRandomItem(channelTypes),
        name: "Auth Service Support",
        contact: "#auth-support",
        description: "Support channel for authentication issues",
      },
    ];

    const monitoringChannels = [
      {
        type: getRandomItem(channelTypes),
        name: "Auth Service Dashboard",
        contact: "#auth-monitoring",
        description: "Monitors authentication service performance",
      },
    ];

    const internalDocumentation = {
      title: "Service API Docs",
      document: "API documentation for internal usage",
      history: {
        time: new Date().toISOString(),
        updatedBy: "Admin",
      },
    };

    // Create the service document
    const serviceDocument = {
      "Entity Type": "Service",
      "Service Name": serviceName,
      Description: description,
      "Source Repo": repoUrl,
      Product: product,
      "Entity Tags": entityTags,
      "Programming Language": getRandomItem(languages),
      Version: version,
      "Service Aliases": serviceAliases,
      "Last Updated": lastUpdated,
      Contacts: contacts,
      "External Documentation": externalDocumentation,
      "Internal Documentation": internalDocumentation,
      "Related Repos": relatedRepos,
      "Support Channels": supportChannels,
      "Monitoring Channels": monitoringChannels,
      "Infrastructure Components": infrastructureComponents,
      "Service Maturity Score(s)": serviceMaturityScores,
    };

    documents.push(serviceDocument);
  }

  return documents;
}
