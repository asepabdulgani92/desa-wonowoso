const { Layanan, Berita, Profil, Galeri, Kontak, Pengajuan, DesaStatistik, PerangkatDesa, SiteSettings } = require('../models/index');
const upload = require('../../utils/upload');

exports.getIndex = async (req, res) => {
    try {
        const beritas = await Berita.find().sort({ createdAt: -1 }).limit(3);
        const desaData = await DesaStatistik.findOne().sort({ createdAt: -1 }) || {
            penduduk: 0,
            kepalaKeluarga: 0,
            rtRw: 0,
            hektarLuas: 0
        };
        const perangkatDesa = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });

        res.render('index', {
            title: 'Desa Wonowoso | Portal Resmi',
            page: 'beranda',
            beritas,
            desaData,
            perangkatDesa
        });
    } catch (error) {
        console.error(error);
        res.render('index', {
            title: 'Desa Wonowoso',
            page: 'beranda',
            beritas: [],
            desaData: {
                penduduk: 0,
                kepalaKeluarga: 0,
                rtRw: 0,
                hektarLuas: 0
            },
            perangkatDesa: []
        });
    }
};

exports.getLayanan = async (req, res) => {
    try {
        const layanans = await Layanan.find();

        res.render('layanan', {
            title: 'Layanan | Desa Wonowoso',
            page: 'layanan',
            layanans
        });
    } catch (error) {
        console.error(error);
        res.render('layanan', { title: 'Layanan', page: 'layanan', layanans: [] });
    }
};

exports.getLayananDetail = async (req, res) => {
    try {
        const layanan = await Layanan.findById(req.params.id);
        if (!layanan) {
            return res.redirect('/layanan');
        }
        if (!Array.isArray(layanan.requirements)) {
            layanan.requirements = [];
        }
        res.render('layanan-detail', {
            title: layanan.title + ' | Desa Wonowoso',
            page: 'layanan',
            layanan
        });
    } catch (error) {
        console.error(error);
        res.redirect('/layanan');
    }
};

const normalizeBeritaCategory = (category) => {
    const value = String(category || '').trim().toLowerCase();
    const categoryMap = {
        kegiatan: 'Kegiatan',
        pembangunan: 'Pembangunan',
        wisata: 'Kegiatan',
        sosial: 'Sosial',
        'berita desa': 'Kegiatan',
        pengumuman: 'Kegiatan',
        fasilitas: 'Kegiatan',
        pemandangan: 'Kegiatan'
    };

    return categoryMap[value] || 'Kegiatan';
};

const getBeritaCategoryAliases = (category) => {
    const normalized = normalizeBeritaCategory(category);
    const aliases = {
        Kegiatan: ['Kegiatan', 'Berita Desa', 'Pengumuman', 'Wisata', 'Fasilitas', 'Pemandangan'],
        Pembangunan: ['Pembangunan'],
        Sosial: ['Sosial']
    };

    return aliases[normalized] || [normalized];
};

exports.getBerita = async (req, res) => {
    try {
        const beritas = await Berita.find().sort({ createdAt: -1 });
        res.render('berita', {
            title: 'Berita | Desa Wonowoso',
            page: 'berita',
            beritas,
            currentCategory: 'all'
        });
    } catch (error) {
        console.error(error);
        res.render('berita', { title: 'Berita', page: 'berita', beritas: [], currentCategory: 'all' });
    }
};

exports.getBeritaCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const normalizedCategory = normalizeBeritaCategory(category);
        const aliases = getBeritaCategoryAliases(normalizedCategory);
        const beritas = await Berita.find({ category: { $in: aliases } }).sort({ createdAt: -1 });

        let displayCategory = normalizedCategory;

        res.render('berita', {
            title: `Berita ${displayCategory} | Desa Wonowoso`,
            page: 'berita',
            beritas,
            currentCategory: normalizedCategory.toLowerCase()
        });
    } catch (error) {
        console.error(error);
        res.render('berita', { title: 'Berita', page: 'berita', beritas: [], currentCategory: 'all' });
    }
};



exports.getBeritaDetail = async (req, res) => {
    try {
        const berita = await Berita.findById(req.params.id);
        if (!berita) {
            return res.redirect('/berita');
        }
        res.render('berita-detail', { // Need to create this view or reuse/modal? User didn't ask for detail page explicitly in "Tugas Utama" logic but in routes yes?
            // User asked "Route publik: /layanan, /berita, /profil ...". Details not explicitly listed but implied.
            // For now, I'll allow it to fallback or create a simple detail view if I have time.
            // Or just render a modal in the main page?
            // The HTML `berita.html` has cards. 
            // I'll render a simple detail page or redirect to list for now if view missing.
            // Let's assume we render 'berita' with a specific opened modal or separate page.
            // I'll create a `berita-detail.ejs` later if needed. For now just render 'berita' with single item? No.
            // Let's just comment this out or implementation simple render check.
            title: berita.title,
            page: 'berita',
            berita
        });
    } catch (error) {
        res.redirect('/berita');
    }
};

exports.getProfil = async (req, res) => {
    try {
        const profil = await Profil.findOne() || {};
        res.render('profil', {
            title: 'Profil | Desa Wonowoso',
            page: 'profil',
            profil
        });
    } catch (error) {
        console.error(error);
        res.render('profil', { title: 'Profil', page: 'profil', profil: null });
    }
};

exports.getGaleri = async (req, res) => {
    try {
        const galeris = await Galeri.find().sort({ createdAt: -1 });
        const normalizedGaleris = galeris.map(item => ({
            ...item.toObject(),
            category: (() => {
                const value = String(item.category || '').trim().toLowerCase();
                if (['kegiatan', 'wisata', 'fasilitas', 'pemandangan'].includes(value)) return 'Kegiatan';
                if (['pembangunan'].includes(value)) return 'Pembangunan';
                return 'Kegiatan';
            })()
        }));

        res.render('galeri', {
            title: 'Galeri | Desa Wonowoso',
            page: 'galeri',
            galeris: normalizedGaleris
        });
    } catch (error) {
        console.error(error);
        res.render('galeri', { title: 'Galeri', page: 'galeri', galeris: [] });
    }
};

exports.getKontak = async (req, res) => {
    try {
        const siteSettings = await SiteSettings.findOne() || {};
        res.render('kontak', {
            title: 'Kontak | Desa Wonowoso',
            page: 'kontak',
            siteSettings
        });
    } catch (error) {
        console.error('Get kontak settings error:', error);
        res.render('kontak', {
            title: 'Kontak | Desa Wonowoso',
            page: 'kontak',
            siteSettings: {}
        });
    }
};

exports.postKontak = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        await Kontak.create({ name, email, phone, subject, message });
        // In a real app we might flash success message
        // req.flash('success', 'Pesan berhasil dikirim');
        res.redirect('/kontak'); // or render with success flag
    } catch (error) {
        console.error(error);
        res.redirect('/kontak');
    }
};

exports.postPengajuan = async (req, res) => {
    upload.fields([
        { name: 'ktpFile', maxCount: 1 },
        { name: 'kkFile', maxCount: 1 },
        { name: 'requirementFiles', maxCount: 50 }
    ])(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            req.flash('error', 'Gagal mengunggah file: ' + err.message);
            return res.redirect('/layanan');
        }

        try {
            const {
                layananId,
                nama,
                email,
                phone,
                address,
                jenisKelamin,
                tempatLahir,
                tanggalLahir,
                kewarganegaraan,
                agama,
                pekerjaan,
                rt,
                rw
            } = req.body;

            const keperluan = req.body.keperluan || req.body.description || '';
            const requirementLabels = Array.isArray(req.body.requirementLabels)
                ? req.body.requirementLabels
                : req.body.requirementLabels
                    ? [req.body.requirementLabels]
                    : [];
            const uploadedRequirementFiles = req.files?.requirementFiles || [];
            const matchedKtpFile = uploadedRequirementFiles.find((file, index) => {
                const target = requirementLabels[index] || '';
                return /ktp/i.test(target) || /kartu tanda penduduk/i.test(target);
            });
            const matchedKkFile = uploadedRequirementFiles.find((file, index) => {
                const target = requirementLabels[index] || '';
                return /kk/i.test(target) || /kartu keluarga/i.test(target);
            });
            const ktpFile = req.files?.ktpFile?.[0]?.filename || matchedKtpFile?.filename || null;
            const kkFile = req.files?.kkFile?.[0]?.filename || matchedKkFile?.filename || null;

            console.log('Pengajuan request body:', req.body);
            console.log('Pengajuan uploaded files:', req.files);

            await Pengajuan.create({
                layananId,
                nama,
                jenisKelamin,
                tempatLahir,
                tanggalLahir,
                kewarganegaraan,
                agama,
                pekerjaan,
                rt,
                rw,
                ktp: Boolean(ktpFile),
                kk: Boolean(kkFile),
                email,
                phone,
                address,
                keperluan,
                ktpFile,
                kkFile,
                status: 'Pending'
            });

            req.flash('success', 'Pengajuan berhasil dikirim. Admin akan meninjau permohonan Anda.');
            res.redirect('/layanan');
        } catch (error) {
            console.error('Submission error:', error, 'body:', req.body, 'files:', req.files);
            req.flash('error', 'Terjadi kesalahan sistem. Silakan coba lagi.');
            res.redirect('/layanan');
        }
    });
};
