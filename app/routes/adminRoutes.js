const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');
const upload = require('../../utils/upload');

router.use(protect); // Protect all routes

router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', adminController.getDashboard);

// Layanan
router.get('/layanan', adminController.getLayanan);
router.get('/layanan/:id/edit', adminController.getEditLayanan);
router.post('/layanan', adminController.createLayanan);
router.post('/layanan/:id', adminController.updateLayanan); // Fallback for HTML form submissions
router.put('/layanan/:id', adminController.updateLayanan);
router.delete('/layanan/:id', adminController.deleteLayanan);

// Data Desa
router.get('/desa-data', adminController.getDesaData);
router.post('/desa-data', adminController.saveDesaData);
router.put('/desa-data/:id', adminController.saveDesaData);
router.delete('/desa-data/:id', adminController.deleteDesaData);

// Berita
router.get('/berita', adminController.getBerita);
router.get('/berita/:id/edit', adminController.getEditBerita);
router.post('/berita', upload.single('image'), adminController.createBerita);
router.put('/berita/:id', upload.single('image'), adminController.updateBerita); // method-override used here
router.delete('/berita/:id', adminController.deleteBerita);

// Galeri
router.get('/galeri', adminController.getGaleri);
router.get('/galeri/:id/edit', adminController.getEditGaleri);
router.post('/galeri', upload.single('image'), adminController.createGaleri);
router.put('/galeri/:id', upload.single('image'), adminController.updateGaleri);
router.delete('/galeri/:id', adminController.deleteGaleri);

// Profil
router.get('/profil', adminController.getProfil);
router.post('/profil', upload.fields([
    { name: 'imageSejarah', maxCount: 1 },
    { name: 'imageVisi', maxCount: 1 },
    { name: 'imageMisi', maxCount: 1 },
    { name: 'imageGeografis', maxCount: 1 },
    { name: 'imageDemografis', maxCount: 1 }
]), adminController.updateProfil);

// Perangkat Desa
router.get('/perangkat-desa', adminController.getPerangkatDesa);
router.post('/perangkat-desa', upload.single('photo'), adminController.createPerangkatDesa);
router.put('/perangkat-desa/:id', upload.single('photo'), adminController.updatePerangkatDesa);
router.delete('/perangkat-desa/:id', adminController.deletePerangkatDesa);

// Kontak
router.get('/kontak', adminController.getSiteSettings);
router.post('/kontak', adminController.saveSiteSettings);
router.put('/kontak/:id', adminController.saveSiteSettings);
router.delete('/kontak/:id', adminController.deleteSiteSettings);

// Inbox Pesan
router.get('/inbox-pesan', adminController.getKontak);
router.delete('/inbox-pesan/:id', adminController.deleteKontak);

// Pengajuan
router.get('/pengajuan', adminController.getPengajuan);
router.get('/pengajuan/:id/surat', adminController.getSuratPengantar);
router.all('/pengajuan/preview', adminController.previewPengajuan);
router.all('/pengajuan/:id/preview', adminController.previewPengajuan);
router.post('/pengajuan/:id/approve', adminController.approvePengajuan);
router.post('/pengajuan/:id/reject', adminController.rejectPengajuan);

module.exports = router;
