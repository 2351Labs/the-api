const Item = require("../models/item");

async function pagination(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided

  // using single aggregation pipeline to ensure that the total count is accurate. 
  // (ensure using same snapshot of database for both queries)
  try {
    const skip = (page - 1) * pageSize;

    const result = await Item.aggregate([
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
