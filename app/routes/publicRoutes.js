const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getIndex);
router.get('/layanan', publicController.getLayanan);
router.get('/layanan/:id', publicController.getLayananDetail);
router.get('/berita', publicController.getBerita);
router.get('/berita/kategori/:category', publicController.getBeritaCategory);
router.get('/berita/:id', publicController.getBeritaDetail);
router.get('/profil', publicController.getProfil);
router.get('/galeri', publicController.getGaleri);
router.get('/kontak', publicController.getKontak);
router.post('/kontak', publicController.postKontak);

router.post('/layanan/ajukan', publicController.postPengajuan);

module.exports = router;
