const Item = require("../models/item");
const { OAuth2Client } = require("google-auth-library");
const { jwtDecode } = require("jwt-decode");
const axios = require("axios");
const jwt = require("jsonwebtoken");

async function getIdsForPage(req, res) {
    console.log("GETTING IDS FOR PAGE")
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided

  try {
    const skip = (page - 1) * pageSize; // Calculate documents to skip
    // Find the items with pagination
    const items = await Item.find() // You can add query filters here if needed
      .skip(skip) // Skip the items for the previous pages
      .limit(pageSize); // Limit the number of items per page

    // Get the total count of items for pagination purposes
    const totalItems = await Item.countDocuments();
    res.json({
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  getIdsForPage,
};
