const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: {
          type: Number
        }
      }
    ],
    totalPrice: {
      type: Number
    }
  }
}, {
  timestamps: {
    createdAt: "createdAt"
  }
})

userSchema.methods.addToCart = function(product) {
  let price = parseFloat(product.price);
  let upDatedTotalPrice = 0;
  let totalPrice = this.cart.totalPrice;
  if (!totalPrice) {
    totalPrice = 0;
  }

  // is product in cart already??? return Index or -1
  const Index = this.cart.items.findIndex(item => {
    return String(item.productId) === String(product._id);
  });

  const updatedCartItems = [...this.cart.items];
  if (Index >= 0) {
    // YES - existing product in cart
    updatedCartItems[Index].quantity = this.cart.items[Index].quantity + 1;
  } else {
    // NO - product NOT in cart
    updatedCartItems.push({
      productId: product._id,
      quantity: 1
    });
  }
  upDatedTotalPrice = totalPrice + price;

  this.cart = {
    items: updatedCartItems,
    totalPrice: upDatedTotalPrice
  };

  return this.save();
};

userSchema.methods.getCart = function() {
  const itemIds = this.cart.items.map(item => {
    return item.productId;
  });
  console.log(itemIds);
  return this.cart.itemIds
    .findById(this.cart.items.productId)
    .toArray()
    .then(products => {
      return products.map(product => {
        return {
          ...product,
          quantity: this.cart.items.find(item => {
            return item.productId.toString() === product._id.toString();
          }).quantity
        };
      });
    });
};

userSchema.methods.deleteFromCart = function(productId, subTotal) {
  const filteredItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  if (filteredItems.length) {
    this.cart = {
      items: [...filteredItems],
      totalPrice: this.cart.totalPrice - subTotal
    };
  } else {
    this.cart = {
      items: [],
      totalPrice: 0
    };
  }

  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = {
    items: [],
    totalPrice: 0
  };

  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const getDb = require("../util/connection").getDb;
// const ObjectId = require("mongodb").ObjectID;
// const bcrypt = require("bcryptjs");
// const salt = bcrypt.genSaltSync(10);
// require("datejs");

// exports.UserModel = class User {
//   constructor(userName, email, pw, cart, id) {
//     this.email = email;
//     this.name = userName;
//     this.pw = bcrypt.hashSync(pw, salt);
//     this.cart = cart;
//     this._id = id;
//   }
