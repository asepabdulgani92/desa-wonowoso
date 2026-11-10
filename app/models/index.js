const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

const layananSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    icon: { type: String, default: 'fas fa-file-alt' },
    requirements: [String]
}, { timestamps: true });

const Layanan = mongoose.model('Layanan', layananSchema);

const pengajuanSchema = new mongoose.Schema({
    layananId: { type: mongoose.Schema.Types.ObjectId, ref: 'Layanan', required: true },
    nama: { type: String, required: true },
    jenisKelamin: String,
    tempatLahir: String,
    tanggalLahir: Date,
    kewarganegaraan: String,
    agama: String,
    pekerjaan: String,
    rt: String,
    rw: String,
    ktp: Boolean,
    kk: Boolean,
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    keperluan: { type: String, required: true },
    tanggalBerlaku: Date,
    nomorSurat: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    ktpFile: String,
    kkFile: String,
    adminFile: String, // Path to approved/stamped file
    rejectionReason: String
}, { timestamps: true });

const Pengajuan = mongoose.model('Pengajuan', pengajuanSchema);

const desaStatistikSchema = new mongoose.Schema({
    penduduk: { type: String, default: '0' },
    kepalaKeluarga: { type: String, default: '0' },
    rtRw: { type: String, default: '0' },
    hektarLuas: { type: String, default: '0' }
}, { timestamps: true });

const DesaStatistik = mongoose.model('DesaStatistik', desaStatistikSchema);

const beritaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    category: String,
    author: String
}, { timestamps: true });

const Berita = mongoose.model('Berita', beritaSchema);

const profilSchema = new mongoose.Schema({
    sejarah: String,
    imageSejarah: String, // Path to image file
    visi: String,
    imageVisi: String, // Path to image file
    misi: [String],
    imageMisi: String, // Path to image file
    demografis: String, // Added demografis field
    imageDemografis: String, // Path to image file
    geografis: String,
    imageGeografis: String // Path to image file
});

const Profil = mongoose.model('Profil', profilSchema);

const galeriSchema = new mongoose.Schema({
    title: String,
    image: { type: String, required: true },
    category: String, // kegiatan, pembangunan, wisata, dll
}, { timestamps: true });

const Galeri = mongoose.model('Galeri', galeriSchema);

const kontakSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Kontak = mongoose.model('Kontak', kontakSchema);

const perangkatDesaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    photo: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const PerangkatDesa = mongoose.model('PerangkatDesa', perangkatDesaSchema);

const siteSettingsSchema = new mongoose.Schema({
    brandName: { type: String, default: 'Desa Wonowoso' },
    address: { type: String, default: 'Jl. Raya Wonowoso No. 1, Kec. Karangtengah, Kab. Demak, Jawa Tengah 59566' },
    phone: { type: String, default: '(0291) 123-4567' },
    email: { type: String, default: 'desawonowoso@gmail.com' },
    operationalHours: { type: String, default: 'Senin - Jumat: 08.00 - 15.00 WIB' },
    mapEmbedUrl: { type: String, default: 'https://www.google.com/maps?q=Desa%20Wonowoso&output=embed' },
    facebookUrl: { type: String, default: '#' },
    instagramUrl: { type: String, default: '#' },
    twitterUrl: { type: String, default: '#' },
    youtubeUrl: { type: String, default: '#' },
    whatsappUrl: { type: String, default: '#' },
    footerDescription: { type: String, default: 'Website resmi Desa Wonowoso, Kecamatan Karangtengah, Kabupaten Demak, Jawa Tengah. Melayani dengan sepenuh hati untuk masyarakat.' },
    copyrightText: { type: String, default: '© 2026 Desa Wonowoso. Hak Cipta Dilindungi.' }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

const uploadedFileSchema = new mongoose.Schema({
    filename: { type: String, required: true, unique: true, index: true },
    mimetype: { type: String, default: 'application/octet-stream' },
    data: { type: Buffer, required: true },
    size: Number
}, { timestamps: true });

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);

module.exports = {
    Admin,
    Layanan,
    Pengajuan,
    DesaStatistik,
    Berita,
    Profil,
    Galeri,
    Kontak,
    PerangkatDesa,
    SiteSettings,
    UploadedFile
};
