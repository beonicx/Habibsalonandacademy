const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const {
  getAllImages,
  createImage,
  updateImage,
  deleteImage,
  reorderImages,
  getCategories,
} = require("../../controllers/admin/galleryController");

router.get("/", getAllImages);
router.get("/categories", getCategories);
router.post("/", createImage);
router.post("/reorder", reorderImages);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = router;
