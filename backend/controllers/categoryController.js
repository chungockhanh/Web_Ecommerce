const Category = require("../models/category");
const Product = require("../models/product");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

// Create new category  
exports.newCategory = catchAsyncErrors(async (req, res, next) => {
  
  req.body.user = req.user.id;
  
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    category,
  });
});

// Get all categories
exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  // const resPerPage = 4;
  const categoryCount = await Category.countDocuments();

  const apiFeatures = new APIFeatures(Category.find(), req.query).search();
  //   .filter()
  //   .pagination(resPerPage);

  const categories = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: categories.length,
    categoryCount,
    categories,
  });
});

// Get single category details
exports.getSingleCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// Update Category
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    category,
  });
});

// Delete Category
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  const countProductWithCategoryID = await Product.countDocuments({
    category: req.params.id,
  });

  if (countProductWithCategoryID > 0) {
    return next(
      new ErrorHandler(
        `Not allowed to delete because the category still has ${countProductWithCategoryID} ${
          countProductWithCategoryID > 1 ? "products" : "product"
        }`,
        405
      )
    );
  }

  await category.deleteOne(category._id);

  res.status(200).json({
    success: true,
    message: "Category is deleted",
  });
});
