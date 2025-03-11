const Item = require("../models/item");
const { ObjectId } = require("mongodb"); // ✅ Import ObjectId from MongoDB

function capitalizeFirstLetter(str) {
  if (typeof str !== "string") return ""; // Ensure the input is a string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function updateInternalDocument(req, res) {
  const { id } = req.params;
  const { document } = req.body;
  try {
    const result = await Item.findOneAndUpdate(
      { _id: new ObjectId(id) }, // Match document by _id
      {
        $set: {
          "Internal Documentation.document": document, // Update document field
        },
        $push: {
          "Internal Documentation.history": {
            time: new Date().toISOString(), // Add the current timestamp
            updatedBy: new ObjectId(req.user._id), // User who made the update
          },
        },
      },
      {
        upsert: true, // Create the history array if it doesn't exist
        new: true, // Return the updated document
      }
    );
    console.log("Updated Document:", result["Internal Documentation"]);
    res.status(200).send("Save was successful!");
  } catch (error) {
    console.error("Error updating internal documentation:", error);
  }
}

async function pagination(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided
  const searchQuery = req.query.q || ""; // Get the search query (e.g., service name)
  const sort = parseInt(req.query.sort) || 1; //1 for ascending order, -1 for descending order
  const sortBy = capitalizeFirstLetter(req.query.sortBy) || ""; //EX: "Service Name"
  const entityTypes = req.query.entityTypes
    ? req.query.entityTypes?.split(",")
    : []; // Get an array of entity types (if provided)
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
        $in: entityTypes.map((type) => new RegExp(`^${type}$`, "i")), // Case-insensitive regex match for each entity type
      };
    }

    // FOR SORTING:
    let sortByDefinition = []; //must calculate average to sort by average score
    if (sortBy && sort) {
      if (sortBy == "Service Maturity Score(s)") {
        console.log("BY AVERAGE");
        sortByDefinition = [
          { $addFields: { originalScores: "$Service Maturity Score(s)" } }, // Preserve the original array
          { $unwind: "$Service Maturity Score(s)" }, // Flatten the array
          {
            $group: {
              _id: "$_id", // Group by document _id to avoid duplicates by service name
              avgScore: { $avg: "$Service Maturity Score(s).score" }, // Calculate average score
              originalDoc: { $first: "$$ROOT" }, // Keep the original document
            },
          },
          { $sort: { avgScore: sort } }, // Sort by average score in ascending or descending order
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$originalDoc", { avgScore: "$avgScore" }],
              }, // Add avgScore to the original document
            },
          },
          {
            $set: {
              "Service Maturity Score(s)": "$originalScores", // Restore the original array
            },
          },
          {
            $project: {
              originalScores: 0, // Remove the "originalScores" field if not needed in the final result
            },
          },
        ];
      } else {
        //for default (sort alphabetical)
        sortByDefinition = [
          {
            $sort: {
              [sortBy]: sort, // Sort by the field provided in query param 'sortBy', and order provided in 'sort'
            },
          },
        ]; // Ascending order
      }
    }
    // Aggregation pipeline with filter, pagination, and total count
    const result = await Item.aggregate([
      ...sortByDefinition, //get additional sort aggregate if given
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
  updateInternalDocument,
};
