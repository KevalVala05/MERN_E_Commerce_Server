import Product from "../models/Product.js";

// Public: GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

    const query = { isDeleted: false };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };

    let productsQuery = Product.find(query);

    // Sorting
    if (sort) {
      const sortBy = {};
      const [field, order] = sort.split(":"); // example: price:asc
      sortBy[field] = order === "desc" ? -1 : 1;
      productsQuery = productsQuery.sort(sortBy);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    productsQuery = productsQuery.skip(skip).limit(Number(limit));

    const products = await productsQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Cloudinary image URLs
    const images = req.files.map(file => file.path);

    const product = await Product.create({ 
      name, 
      description, 
      price, 
      category, 
      images, 
      stock 
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) return res.status(404).json({ message: "Product not found" });

    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: DELETE /api/products/:id (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) return res.status(404).json({ message: "Product not found" });

    product.isDeleted = true;
    await product.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
