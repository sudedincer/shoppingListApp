const express     = require('express');
const mongoose    = require('mongoose');
const List        = require('../schemas/List');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    console.log("Kullanıcı:", req.user); // burası çok kritik
    const lists = await List.find({ userEmail: req.user.email });
    res.json(lists);
  } catch (err) {
    console.error('List çekme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// ✅ Tek bir listeyi getir
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Geçersiz liste ID' });
  }

  try {
    const list = await List.findOne({ _id: id, userEmail: req.user.email });
    if (!list) {
      return res.status(404).json({ message: 'Liste bulunamadı.' });
    }
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});
// ✅ Yeni liste oluştur
router.post('/create', verifyToken, async (req, res) => {
  const { name, category, color, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Liste adı gerekli.' });
  }

  try {
    const newList = new List({
      name,
      category,
      color,
      description,
      userEmail: req.user.email
    });

    await newList.save();
    res.status(201).json(newList);
  } catch (err) {
    console.error('Liste oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

module.exports = router;