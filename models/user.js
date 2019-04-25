const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
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
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
          },
          title: {
            type: String
          },
          description: {
            type: String
          },
          price: {
            type: Number
          },
          quantity: {
            type: Number
          }
        }
      ],
      totalPrice: {
        default: 0,
        type: Number
      }
    }
  },
  {
    timestamps: {
      createdAt: "createdAt"
    }
  }
);

userSchema.methods.addItem = function(product) {
  let price = product.price;
  let upDatedTotalPrice = 0;
  let totalPrice = this.cart.totalPrice || 0;

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
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: 1
    });
  }
  upDatedTotalPrice = totalPrice + price;

  this.cart = {
    items: updatedCartItems,
    totalPrice: upDatedTotalPrice
  };

  this.save();
  return this.cart;
};

userSchema.methods.deleteItem = function(productId, subTotal) {
  const filteredItems = this.cart.items.filter(item => {
    return String(item.productId) !== String(productId);
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

  this.save();
  return this.cart;
};

userSchema.methods.incItemQty = function(productId, price) {
  const Index = this.cart.items.findIndex(item => {
    return String(item.productId) === String(productId);
  });
  this.cart.items[Index].quantity++;
  this.cart.totalPrice += price;

  this.save();
  return this.cart;
};

userSchema.methods.decItemQty = function(productId, price) {
  const Index = this.cart.items.findIndex(item => {
    return String(item.productId) === String(productId);
  });
  this.cart.items[Index].quantity--;
  this.cart.totalPrice -= price;

  this.save();
  return this.cart;
};

userSchema.methods.getCart = function() {
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

userSchema.methods.clearCart = function() {
  this.cart = {
    items: [],
    totalPrice: 0
  };

  return this.save();
};

module.exports = mongoose.model("User", userSchema);
