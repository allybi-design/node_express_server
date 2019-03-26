const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      name: {
        type: String,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    },
    products: [
      {
        product: {
          type: Object,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt"
    }
  }
);

module.exports = mongoose.model("Order", orderSchema);
