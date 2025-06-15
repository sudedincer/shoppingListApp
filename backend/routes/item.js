const express = require('express');
const Item = require('../schemas/Item'); 
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// Tüm item'ları getir (isteğe bağlı olarak userEmail ile filtrelenebilir)
router.get("/", verifyToken, async (req, res) => {
    const items = await Item.find({ userEmail: req.user.email }); // Token'dan email
    res.json(items);
});

// Belirli bir item getir
router.get("/:id", verifyToken, async (req, res) => {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    res.json(item);
});

// Yeni item oluştur
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { itemName, quantity, bought } = req.body;

        if (!itemName || typeof quantity !== "number") {
            return res.status(400).json({ message: "itemName ve quantity zorunludur." });
        }

        const newItem = await Item.create({
            itemName,
            quantity,
            bought: bought || false,
            userEmail: req.user.email
        });

        res.status(201).json(newItem);
    } catch (err) {
    console.error("Item oluşturulurken hata:", err.message);
    res.status(500).json({
        message: "Sunucu hatası.",
        error: err.message
    });
}
});

// Item güncelle
router.patch('/update/:id', verifyToken, async (req, res) => {
    const itemId = req.params.id;
    const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, { new: true });
    res.json(updatedItem);
});

// Item sil
router.delete("/delete/:id", verifyToken, async (req, res) => {
    const itemId = req.params.id;
    const deletedItem = await Item.findByIdAndDelete(itemId);
    res.json(deletedItem);
});

module.exports = router;
