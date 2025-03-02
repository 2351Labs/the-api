const Item = require("../models/item");

async function pagination(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided
  const searchQuery = req.query.q || ""; // Get the search query (e.g., service name)
  const entityTypes = req.query.entityTypes
    ? req.query.entityTypes.split(",")
    : []; // Get an array of entity types (if provided)
  console.log("entityTypes", entityTypes);
  // using single aggregation pipeline to ensure that the total count is accurate.
  try {
    const skip = (page - 1) * pageSize;

    // Build filter query for both search and service type
    const filterQuery = {};

    if (searchQuery) {
      filterQuery["Service Name"] = { $regex: searchQuery, $options: "i" }; // Case-insensitive search for service name
    }
  
    if (entityTypes.length > 0) {
      // Use $regex to perform case-insensitive matching for each entity type
      filterQuery["Entity Type"] = {
        $in: entityTypes.map(type => new RegExp(`^${type}$`, "i")), // Case-insensitive regex match for each entity type
      };
    }

    console.log("filterQuery", filterQuery);
    // Aggregation pipeline with filter, pagination, and total count
    const result = await Item.aggregate([
      {
        $match: filterQuery, // Apply filter if available
      },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const items = result[0].items;
    const totalItems =
      result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;
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
  // try {
  //   const skip = (page - 1) * pageSize; // Calculate documents to skip

  //   // Execute both queries concurrently
  //   const [items, totalItems] = await Promise.all([
  //     Item.find().skip(skip).limit(pageSize), // Fetch paginated items
  //     Item.countDocuments(), // Get total count
  //   ]);

  //   res.json({
  //     page,
  //     pageSize,
  //     totalItems,
  //     totalPages: Math.ceil(totalItems / pageSize),
  //     items,
  //   });
  // } catch (error) {
  //   console.error("Error fetching items:", error);
  //   res.status(500).send("Internal Server Error");
  // }
}

async function itemById(req, res) {
  const id = req.params.id;
  console.log("GETTING by ID");

  try {
    const item = await Item.findById(id);

    // Get the total count of items for pagination purposes
    res.json(item);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  pagination,
  itemById,
};
