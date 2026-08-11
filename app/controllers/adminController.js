const { Layanan, Berita, Profil, Galeri, Kontak, Pengajuan, DesaStatistik, PerangkatDesa, SiteSettings } = require('../models/index');

exports.getDashboard = async (req, res) => {
    let profilData = {};
    try {
        const layananCount = await Layanan.countDocuments();
        const beritaCount = await Berita.countDocuments();
        const galeriCount = await Galeri.countDocuments();
        const contactCount = await Kontak.countDocuments();
        const unreadContactCount = await Kontak.countDocuments({ read: false });

        // Pengajuan Stats
        const pendingCount = await Pengajuan.countDocuments({ status: 'Pending' });
        const approvedCount = await Pengajuan.countDocuments({ status: 'Approved' });
        const rejectedCount = await Pengajuan.countDocuments({ status: 'Rejected' });

        // Fetch Profil explicitly
        const profil = await Profil.findOne();
        if (profil) {
            profilData = profil;
        }

        res.render('admin/dashboard', {
            layout: 'admin/layout',
            title: 'Dashboard Admin',
            layananCount,
            beritaCount,
            galeriCount,
            contactCount,
            unreadContactCount,
            pendingCount,
            approvedCount,
            rejectedCount,
            profil: profilData
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.render('admin/dashboard', {
            layout: 'admin/layout',
            title: 'Dashboard',
            error: 'Gagal memuat dashboard: ' + error.message,
            // Provide default values for all variables used in dashboard.ejs to prevent ReferenceError
            layananCount: 0,
            beritaCount: 0,
            galeriCount: 0,
            contactCount: 0,
            unreadContactCount: 0,
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            profil: profilData // Keep it empty object if failed
        });
    }
};

// --- LAYANAN ---
exports.getLayanan = async (req, res) => {
    const layanans = await Layanan.find();
    res.render('admin/layanan/index', { layout: 'admin/layout', title: 'Kelola Layanan', layanans });
};
exports.createLayanan = async (req, res) => {
    try {
        const { title, description, icon, requirements } = req.body;
        const requirementsArray = requirements
            ? requirements.split('\n').map(r => r.trim()).filter(r => r !== '')
            : [];

        await Layanan.create({ title, description, icon, requirements: requirementsArray });
        req.flash('success', 'Layanan berhasil dibuat');
        res.redirect('/admin/layanan');
    } catch (error) {
        console.error('Create layanan error:', error, req.body);
        req.flash('error', 'Gagal membuat layanan: ' + error.message);
        res.redirect('/admin/layanan');
    }
};
exports.getEditLayanan = async (req, res) => {
    const layanan = await Layanan.findById(req.params.id);
    res.render('admin/layanan/edit', { layout: 'admin/layout', title: 'Edit Layanan', layanan });
};
exports.updateLayanan = async (req, res) => {
    try {
        const { title, description, icon, requirements } = req.body;
        const updateData = { title, description, icon };

        if (typeof requirements === 'string') {
            updateData.requirements = requirements
                .split('\n')
                .map(r => r.trim())
                .filter(r => r !== '');
        }

        console.log('Update Layanan:', req.params.id, req.body, updateData);
        await Layanan.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        req.flash('success', 'Layanan berhasil diperbarui');
        res.redirect('/admin/layanan');
    } catch (error) {
        console.error('Update layanan error:', error, req.body);
        req.flash('error', 'Gagal memperbarui layanan: ' + error.message);
        res.redirect('/admin/layanan');
    }
};
exports.deleteLayanan = async (req, res) => {
    await Layanan.findByIdAndDelete(req.params.id);
    res.redirect('/admin/layanan');
};

// --- DATA DESA ---
exports.getDesaData = async (req, res) => {
    try {
        const desaData = await DesaStatistik.findOne().sort({ createdAt: -1 }) || new DesaStatistik();
        res.render('admin/desa-data/index', {
            layout: 'admin/layout',
            title: 'Data Desa',
            desaData
        });
    } catch (error) {
        console.error('Get DesaData error:', error);
        res.render('admin/desa-data/index', {
            layout: 'admin/layout',
            title: 'Data Desa',
            desaData: new DesaStatistik()
        });
    }
};

exports.saveDesaData = async (req, res) => {
    try {
        const { penduduk, kepalaKeluarga, rtRw, hektarLuas } = req.body;
        const payload = {
            penduduk: String(penduduk || '0').trim(),
            kepalaKeluarga: String(kepalaKeluarga || '0').trim(),
            rtRw: String(rtRw || '0').trim(),
            hektarLuas: String(hektarLuas || '0').trim()
        };

        let desaData = req.params.id
            ? await DesaStatistik.findById(req.params.id)
            : await DesaStatistik.findOne().sort({ createdAt: -1 });

        if (!desaData) {
            desaData = new DesaStatistik();
        }

        Object.assign(desaData, payload);
        await desaData.save();

        req.flash('success', 'Data desa berhasil disimpan');
        res.redirect('/admin/desa-data');
    } catch (error) {
        console.error('Save DesaData error:', error);
        req.flash('error', 'Gagal menyimpan data desa: ' + error.message);
        res.redirect('/admin/desa-data');
    }
};

exports.deleteDesaData = async (req, res) => {
    try {
        const idToDelete = req.params.id || req.body.id;

        if (idToDelete) {
            await DesaStatistik.findByIdAndDelete(idToDelete);
        } else {
            const latest = await DesaStatistik.findOne().sort({ createdAt: -1 });
            if (latest) {
                await DesaStatistik.findByIdAndDelete(latest._id);
            }
        }

        req.flash('success', 'Data desa berhasil dihapus');
    } catch (error) {
        console.error('Delete DesaData error:', error);
        req.flash('error', 'Gagal menghapus data desa: ' + error.message);
    }
    res.redirect('/admin/desa-data');
};

// --- PERANGKAT DESA ---
const getPerangkatDesaNextOrder = (items = []) => {
    return Array.isArray(items) ? items.length : 0;
};

const syncPerangkatDesaOrder = async (targetId, requestedOrder) => {
    const items = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });
    const list = items.map(item => ({
        _id: item._id.toString(),
        order: item.order
    }));

    const targetOrder = Number.isInteger(Number(requestedOrder)) ? Number(requestedOrder) : list.length;
    const safeOrder = Math.max(0, Math.min(list.length, targetOrder));
    const targetIndex = list.findIndex(item => item._id === targetId.toString());

    if (targetIndex >= 0) {
        const [movingItem] = list.splice(targetIndex, 1);
        list.splice(safeOrder, 0, movingItem);
    } else {
        list.splice(safeOrder, 0, { _id: targetId.toString(), order: safeOrder });
    }

    for (let i = 0; i < list.length; i++) {
        await PerangkatDesa.findByIdAndUpdate(list[i]._id, { order: i }, { new: true });
    }
};

exports.getPerangkatDesa = async (req, res) => {
    try {
        const perangkatDesa = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });
        res.render('admin/perangkat-desa/index', {
            layout: 'admin/layout',
            title: 'Perangkat Desa',
            perangkatDesa,
            nextOrder: getPerangkatDesaNextOrder(perangkatDesa)
        });
    } catch (error) {
        console.error('Get PerangkatDesa error:', error);
        res.render('admin/perangkat-desa/index', {
            layout: 'admin/layout',
            title: 'Perangkat Desa',
            perangkatDesa: [],
            nextOrder: 0
        });
    }
};

exports.createPerangkatDesa = async (req, res) => {
    try {
        const { name, position, order } = req.body;

        if (!name || !position) {
            req.flash('error', 'Nama dan jabatan harus diisi.');
            return res.redirect('/admin/perangkat-desa');
        }

        const existing = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });
        const desiredOrder = Number(order);
        const nextOrder = Number.isInteger(desiredOrder) && desiredOrder >= 0 ? desiredOrder : getPerangkatDesaNextOrder(existing);
        const payload = {
            name: String(name).trim(),
            position: String(position).trim(),
            photo: req.file ? `/uploads/${req.file.filename}` : 'https://cdn.digitaldesa.com/statics/profil-v2/assets/fallback-B6dzNJxy.png',
            order: nextOrder
        };

        const created = await PerangkatDesa.create(payload);
        await syncPerangkatDesaOrder(created._id, nextOrder);
        req.flash('success', 'Data perangkat desa berhasil ditambahkan');
        res.redirect('/admin/perangkat-desa');
    } catch (error) {
        console.error('Create PerangkatDesa error:', error);
        req.flash('error', 'Gagal menambahkan perangkat desa: ' + error.message);
        res.redirect('/admin/perangkat-desa');
    }
};

exports.updatePerangkatDesa = async (req, res) => {
    try {
        const { name, position, order } = req.body;
        const existing = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });
        const current = existing.find(item => item._id.toString() === req.params.id);
        const targetOrder = Number.isInteger(Number(order)) && Number(order) >= 0 ? Number(order) : (current ? current.order : 0);

        const updateData = {
            name: String(name || '').trim(),
            position: String(position || '').trim()
        };

        if (req.file) {
            updateData.photo = `/uploads/${req.file.filename}`;
        }

        await PerangkatDesa.findByIdAndUpdate(req.params.id, updateData, { new: true });
        await syncPerangkatDesaOrder(req.params.id, targetOrder);
        req.flash('success', 'Data perangkat desa berhasil diperbarui');
        res.redirect('/admin/perangkat-desa');
    } catch (error) {
        console.error('Update PerangkatDesa error:', error);
        req.flash('error', 'Gagal memperbarui perangkat desa: ' + error.message);
        res.redirect('/admin/perangkat-desa');
    }
};

exports.deletePerangkatDesa = async (req, res) => {
    try {
        await PerangkatDesa.findByIdAndDelete(req.params.id);
        const remaining = await PerangkatDesa.find().sort({ order: 1, createdAt: 1 });

        for (let i = 0; i < remaining.length; i++) {
            await PerangkatDesa.findByIdAndUpdate(remaining[i]._id, { order: i }, { new: true });
        }

        req.flash('success', 'Data perangkat desa berhasil dihapus');
    } catch (error) {
        console.error('Delete PerangkatDesa error:', error);
        req.flash('error', 'Gagal menghapus perangkat desa: ' + error.message);
    }
    res.redirect('/admin/perangkat-desa');
};

// --- PENGAJUAN ---
exports.getPengajuan = async (req, res) => {
    const status = req.query.status || 'Pending';
    const pengajuans = await Pengajuan.find({ status }).populate('layananId').sort({ createdAt: -1 });

    const pendingCount = await Pengajuan.countDocuments({ status: 'Pending' });
    const approvedCount = await Pengajuan.countDocuments({ status: 'Approved' });
    const rejectedCount = await Pengajuan.countDocuments({ status: 'Rejected' });

    res.render('admin/pengajuan/index', {
        layout: 'admin/layout',
        title: 'Kelola Pengajuan Surat',
        pengajuans,
        currentStatus: status,
        counts: {
            Pending: pendingCount,
            Approved: approvedCount,
            Rejected: rejectedCount
        }
    });
};

const sendEmail = require('../../utils/email');
const path = require('path');

exports.getSuratPengantar = async (req, res) => {
    try {
        const pengajuan = await Pengajuan.findById(req.params.id);
        if (!pengajuan) {
            return res.redirect('/admin/pengajuan');
        }

        const tanggalSurat = new Date();

        res.render('admin/surat-pengantar', {
            nomorSurat: pengajuan.nomorSurat || '',
            nama: pengajuan.nama,
            jenisKelamin: pengajuan.jenisKelamin || '-',
            tempatLahir: pengajuan.tempatLahir || '-',
            tanggalLahir: pengajuan.tanggalLahir,
            kewarganegaraan: pengajuan.kewarganegaraan || '-',
            agama: pengajuan.agama || '-',
            pekerjaan: pengajuan.pekerjaan || '-',
            address: pengajuan.address || '-',
            rt: pengajuan.rt || '-',
            rw: pengajuan.rw || '-',
            ktp: pengajuan.ktp,
            kk: pengajuan.kk,
            keperluan: pengajuan.keperluan || '-',
            tanggalBerlaku: pengajuan.tanggalBerlaku,
            tanggalSurat,
            email: pengajuan.email || '',
            pengajuanId: pengajuan._id,
            isApproved: pengajuan.status === 'Approved'
        });
    } catch (error) {
        console.error('Surat preview error:', error);
        res.redirect('/admin/pengajuan');
    }
};

exports.previewPengajuan = async (req, res) => {
    const pengajuanId = req.body.pengajuanId || req.params.id;
    console.log('[ADMIN ROUTE] previewPengajuan called for id=', pengajuanId, 'method=', req.method, 'url=', req.originalUrl, 'body=', req.body);
    try {
        if (!pengajuanId) {
            return res.redirect('/admin/pengajuan');
        }

        const pengajuan = await Pengajuan.findById(pengajuanId);
        if (!pengajuan) {
            return res.redirect('/admin/pengajuan');
        }

        const { nomorSurat } = req.body;
        if (!nomorSurat) {
            return res.redirect('/admin/pengajuan');
        }

        pengajuan.nomorSurat = nomorSurat;
        await pengajuan.save();

        res.redirect(`/admin/pengajuan/${pengajuan._id}/surat`);
    } catch (error) {
        console.error('Preview error:', error);
        res.redirect('/admin/pengajuan');
    }
};

exports.approvePengajuan = async (req, res) => {
    try {
        const pengajuan = await Pengajuan.findById(req.params.id);

        if (!pengajuan) {
            return res.redirect('/admin/pengajuan');
        }

        const nomorSurat = req.body.nomorSurat || pengajuan.nomorSurat || '';
        if (!nomorSurat) {
            return res.redirect('/admin/pengajuan');
        }

        pengajuan.nomorSurat = nomorSurat;
        pengajuan.status = 'Approved';
        pengajuan.tanggalBerlaku = new Date();
        await pengajuan.save();

        res.redirect('/admin/pengajuan?status=Approved');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/pengajuan');
    }
};

exports.rejectPengajuan = async (req, res) => {
    try {
        const pengajuan = await Pengajuan.findById(req.params.id).populate('layananId');

        if (!pengajuan) {
            return res.redirect('/admin/pengajuan');
        }

        const { rejectionReason } = req.body;
        pengajuan.status = 'Rejected';
        pengajuan.rejectionReason = rejectionReason;
        await pengajuan.save();

        // Send Email
        const message = `
            <h3>Pengajuan Anda Ditolak</h3>
            <p>Halo ${pengajuan.nama},</p>
            <p>Mohon maaf, pengajuan surat <strong>${pengajuan.layananId.title}</strong> Anda belum dapat kami proses.</p>
            <p><strong>Alasan:</strong> ${rejectionReason}</p>
            <p>Silakan perbaiki data/dokumen Anda dan ajukan kembali melalui website.</p>
            <br>
            <p>Terima kasih,<br>Pemerintah Desa Wonowoso</p>
        `;

        try {
            await sendEmail({
                email: pengajuan.email,
                subject: 'Update Status Pengajuan - Desa Wonowoso',
                message
            });
        } catch (emailError) {
            console.error('Email send failed:', emailError);
        }

        res.redirect('/admin/pengajuan?status=Pending');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/pengajuan');
    }
};

// --- BERITA ---
exports.getBerita = async (req, res) => {
    const beritas = await Berita.find().sort({ createdAt: -1 });
    res.render('admin/berita/index', { layout: 'admin/layout', title: 'Kelola Berita', beritas });
};
exports.createBerita = async (req, res) => {
    const { title, content, category } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    await Berita.create({ title, content, category, image, author: 'Admin' });
    res.redirect('/admin/berita');
};
exports.getEditBerita = async (req, res) => {
    const berita = await Berita.findById(req.params.id);
    res.render('admin/berita/edit', { layout: 'admin/layout', title: 'Edit Berita', berita });
};
exports.updateBerita = async (req, res) => {
    const { title, content, category } = req.body;
    const updateData = { title, content, category };
    if (req.file) {
        updateData.image = '/uploads/' + req.file.filename;
    }
    await Berita.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/berita');
};
exports.deleteBerita = async (req, res) => {
    await Berita.findByIdAndDelete(req.params.id);
    res.redirect('/admin/berita');
};

// --- GALERI ---
exports.getGaleri = async (req, res) => {
    const galeris = await Galeri.find().sort({ createdAt: -1 });
    res.render('admin/galeri/index', { layout: 'admin/layout', title: 'Kelola Galeri', galeris });
};
exports.createGaleri = async (req, res) => {
    const { title, category } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    await Galeri.create({ title, category, image });
    res.redirect('/admin/galeri');
};
exports.getEditGaleri = async (req, res) => {
    const galeri = await Galeri.findById(req.params.id);
    res.render('admin/galeri/edit', { layout: 'admin/layout', title: 'Edit Galeri', galeri });
};
// Add update for Galeri too
exports.updateGaleri = async (req, res) => {
    const { title, category } = req.body;
    const updateData = { title, category };
    if (req.file) {
        updateData.image = '/uploads/' + req.file.filename;
    }
    await Galeri.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/galeri');
};
exports.deleteGaleri = async (req, res) => {
    await Galeri.findByIdAndDelete(req.params.id);
    res.redirect('/admin/galeri');
};

// --- KONTAK ---
exports.getKontak = async (req, res) => {
    const kontaks = await Kontak.find().sort({ createdAt: -1 });
    res.render('admin/inbox-pesan/index', { layout: 'admin/layout', title: 'Inbox Pesan', kontaks });
};
exports.deleteKontak = async (req, res) => {
    await Kontak.findByIdAndDelete(req.params.id);
    res.redirect('/admin/inbox-pesan');
};

exports.getSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.findOne() || new SiteSettings();
        res.render('admin/kontak/index', {
            layout: 'admin/layout',
            title: 'Kontak',
            settings
        });
    } catch (error) {
        console.error('Get SiteSettings error:', error);
        res.render('admin/kontak/index', {
            layout: 'admin/layout',
            title: 'Kontak',
            settings: new SiteSettings()
        });
    }
};

exports.saveSiteSettings = async (req, res) => {
    try {
        const normalizeOptional = (value, fallback = '') => {
            const text = String(value ?? '').trim();
            return text === '' ? fallback : text;
        };

        const normalizeSocialUrl = (value) => {
            const text = normalizeOptional(value, '#');
            return text === '#' ? '#' : text;
        };

        const payload = {
            brandName: normalizeOptional(req.body.brandName, 'Desa Wonowoso'),
            address: normalizeOptional(req.body.address),
            phone: normalizeOptional(req.body.phone),
            email: normalizeOptional(req.body.email),
            operationalHours: normalizeOptional(req.body.operationalHours),
            mapEmbedUrl: normalizeOptional(req.body.mapEmbedUrl, 'https://www.google.com/maps?q=Desa%20Wonowoso&output=embed'),
            facebookUrl: normalizeSocialUrl(req.body.facebookUrl),
            instagramUrl: normalizeSocialUrl(req.body.instagramUrl),
            twitterUrl: normalizeSocialUrl(req.body.twitterUrl),
            youtubeUrl: normalizeSocialUrl(req.body.youtubeUrl),
            whatsappUrl: normalizeSocialUrl(req.body.whatsappUrl),
            footerDescription: normalizeOptional(req.body.footerDescription),
            copyrightText: normalizeOptional(req.body.copyrightText, '© 2026 Desa Wonowoso. Hak Cipta Dilindungi.')
        };

        let settings = req.params.id
            ? await SiteSettings.findById(req.params.id)
            : await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings();
        }

        Object.assign(settings, payload);
        await settings.save();

        req.flash('success', 'Data kontak berhasil disimpan');
        res.redirect('/admin/kontak');
    } catch (error) {
        console.error('Save SiteSettings error:', error);
        req.flash('error', 'Gagal menyimpan data kontak: ' + error.message);
        res.redirect('/admin/kontak');
    }
};

exports.deleteSiteSettings = async (req, res) => {
    try {
        const idToDelete = req.params.id || req.body.id;
        if (idToDelete) {
            await SiteSettings.findByIdAndDelete(idToDelete);
            req.flash('success', 'Data kontak & sosial media berhasil dihapus');
        } else {
            req.flash('error', 'ID data tidak ditemukan');
        }
    } catch (error) {
        console.error('Delete SiteSettings error:', error);
        req.flash('error', 'Gagal menghapus data kontak & sosial media: ' + error.message);
    }
    res.redirect('/admin/kontak');
};

// --- PROFIL ---
exports.getProfil = async (req, res) => {
    const profil = await Profil.findOne() || new Profil();
    res.render('admin/profil/index', { layout: 'admin/layout', title: 'Profil Desa', profil });
};
exports.updateProfil = async (req, res) => {
    const { sejarah, visi, misi, geografis, demografis } = req.body;
    const updateData = {
        sejarah,
        visi,
        misi: misi ? misi.split('\n').filter(item => item.trim() !== '') : [],
        geografis,
        demografis
    };

    // Handle image deletion
    if (req.body.deleteImageSejarah) updateData.imageSejarah = null;
    if (req.body.deleteImageVisi) updateData.imageVisi = null;
    if (req.body.deleteImageMisi) updateData.imageMisi = null;
    if (req.body.deleteImageGeografis) updateData.imageGeografis = null;
    if (req.body.deleteImageDemografis) updateData.imageDemografis = null;

    if (req.files) {
        if (req.files.imageSejarah) updateData.imageSejarah = '/uploads/' + req.files.imageSejarah[0].filename;
        if (req.files.imageVisi) updateData.imageVisi = '/uploads/' + req.files.imageVisi[0].filename;
        if (req.files.imageMisi) updateData.imageMisi = '/uploads/' + req.files.imageMisi[0].filename;
        if (req.files.imageGeografis) updateData.imageGeografis = '/uploads/' + req.files.imageGeografis[0].filename;
        if (req.files.imageDemografis) updateData.imageDemografis = '/uploads/' + req.files.imageDemografis[0].filename;
    }

    let profil = await Profil.findOne();
    if (profil) {
        await Profil.findByIdAndUpdate(profil._id, updateData);
    } else {
        await Profil.create(updateData);
    }
    res.redirect('/admin/profil');
};
