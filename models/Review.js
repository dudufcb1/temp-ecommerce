/** @format */

const mongoose = require("mongoose");
const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review Title"],
      maxlenght: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide the comment review"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    // Encuentra el producto por su ID
    const product = await this.model("Product").findById(productId);

    // Verifica si se encontró el producto
    if (product) {
      // Calcula el averageRating y numberOfReviews
      let averageRating = 0;
      let numberOfReviews = 0;

      if (result[0] && result[0].averageRating) {
        averageRating = Math.ceil(result[0].averageRating);
      }

      if (result[0] && result[0].numOfReviews) {
        numberOfReviews = result[0].numOfReviews;
      }

      // Actualiza el producto con los nuevos valores
      await product.updateOne({
        averageRating: averageRating,
        numberOfReviews: numberOfReviews,
      });
    }
  } catch (error) {
    console.log(error);
  }
  //Codigo de john
  /*   try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numberOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  } */
};

ReviewSchema.post("save", async function () {
  //"this work here
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post("findOneAndDelete", async (doc) => {
  await doc.constructor.calculateAverageRating(doc.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
