const User = require("../schema/user.schema");
const Post = require("../schema/post.schema")

module.exports.getUsersWithPostCount = async (req, res) => {


  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // const { page = 1, pageSize = 10 } = req.query;
    // const skip = (page - 1) * pageSize;

    const [users, count] = await Promise.all([
      User.aggregate([
        // {
        //   $lookup: {
        //     from: "Post",
        //     localField: "_id",
        //     foreignField: "userId",
        //     as: "postCount",
        //   },
        // },
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "userId",
            as: "postcount",
          },
        },
        {
          $addFields: {
            posts: {
              $size: "$postcount",
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            posts: 1,
          },
        },
        { $skip: skip },
        { $limit: Number(limit) },
      ]),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(count / limit);

    const pagination = {
      totalDocs: count,
      limit: Number(limit),
      page: Number(page),
      totalPages: totalPages,
      pagingCounter: (Number(page) - 1) * Number(limit) + 1,
      hasPrevPage: Number(page) > 1,
      hasNextPage: Number(page) < totalPages,
      prevPage: Number(page) > 1 ? Number(page) - 1 : null,
      nextPage: Number(page) < totalPages ? Number(page) + 1 : null,
    };

    res.status(200).json({ data: { users, pagination } });
  } catch (error) {
    res.send({ error: error.message });
  }
};







