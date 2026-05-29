import Category from "../model/Category.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, label, family, color, userID } = req.body;

    if (!name || !label || !family || !color) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const category = await Category.create({
      name,
      label,
      family,
      color,
      c_by: userID
    });

    res.status(201).json({
      success: true,
      message: "Category Created",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
   
  try {
    const categories = await Category.find({ c_by: req.user._id }).populate("c_by", "name email");
    res.status(200).json({
      success: true,
      message: "Categories retrieved",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Single Category
export const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      c_by: req.user._id
    }).populate("c_by", "name email");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};