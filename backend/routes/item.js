// routes/item.js
const express     = require('express');
const router      = express.Router();
const Item        = require('../schemas/Item');
const verifyToken = require('../middlewares/verifyToken');

// Tüm itemleri getir (listeye göre filtrelenmiş)
router.get('/', verifyToken, async (req, res) => {
  const { listId } = req.query;

  if (!listId) {
    return res.status(400).json({ message: 'listId parametresi gereklidir.' });
  }

  try {
    const items = await Item.find({ listId, userEmail: req.user.email });
    res.json(items);
  } catch (err) {
    console.error('Item çekme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

router.post('/create', verifyToken, async (req, res) => {
  const { itemName, quantity, unit, bought, listId } = req.body;

  // Zorunlu alan kontrolleri
  if (!itemName || typeof quantity !== 'number' || !unit) {
    return res.status(400).json({ message: 'itemName, quantity ve unit zorunludur.' });
  }
  if (!listId) {
    return res.status(400).json({ message: 'listId zorunludur.' });
  }

  try {
    const newItem = await Item.create({
      itemName,
      quantity,
      unit,
      bought: bought || false,
      userEmail: req.user.email,
      listId
    });
    return res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Öğe oluşturulurken hata oluştu.' });
  }
});

// Öğeyi güncelle (örneğin bought durumunu değiştirme)
router.patch('/update/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updated = await Item.findOneAndUpdate(
      { _id: id, userEmail: req.user.email },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Öğe bulunamadı veya yetkiniz yok.' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Güncelleme hatası:', err);
    res.status(500).json({ message: 'Güncelleme sırasında sunucu hatası.' });
  }
});

// Öğeyi sil
router.delete('/delete/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Item.findOneAndDelete({ _id: id, userEmail: req.user.email });

    if (!deleted) {
      return res.status(404).json({ message: 'Öğe bulunamadı veya yetkiniz yok.' });
    }

    res.json({ message: 'Öğe başarıyla silindi.' });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ message: 'Silme sırasında sunucu hatası.' });
  }
});

module.exports = router;