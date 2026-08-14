// ============================================================
// KONSEKUENSI HARIAN
// ============================================================

let jenisKonsekuensiList = [];
let siswaTerlambatList = [];
let hasilGenerateKonsekuensi = [];

// ---------- TAB NAVIGATION ----------
function switchKonsekuensiTab(tabName) {
    document.querySelectorAll('.kons-tab-btn').forEach(btn => {
        btn.classList.remove('border-b-2', 'border-indigo-600', 'text-indigo-600', 'font-bold');
        btn.classList.add('text-gray-500');
    });
    document.querySelectorAll('.kons-tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('konsTab_' + tabName).classList.remove('hidden');
    const activeBtn = document.getElementById('konsBtnTab_' + tabName);
    activeBtn.classList.add('border-b-2', 'border-indigo-600', 'text-indigo-600', 'font-bold');
    activeBtn.classList.remove('text-gray-500');
    if (tabName === 'jenis') loadJenisKonsekuensi();
    else if (tabName === 'petakan') loadPetakanKonsekuensi();
}

// ---------- TAB 1: JENIS KONSEKUENSI ----------
async function loadJenisKonsekuensi() {
    const tbody = document.getElementById('tbodyJenisKonsekuensi');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400"><i class="fas fa-circle-notch fa-spin mr-2"></i>Memuat data...</td></tr>';
    const res = await fetchAPI('getJenisKonsekuensi', { token: currentUser.token });
    if (!res.success) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-red-500">Gagal memuat: ' + res.message + '</td></tr>'; return; }
    jenisKonsekuensiList = res.data || [];
    renderJenisKonsekuensiTable();
}

function renderJenisKonsekuensiTable() {
    const tbody = document.getElementById('tbodyJenisKonsekuensi');
    if (!jenisKonsekuensiList.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-12 text-gray-400"><i class="fas fa-inbox text-4xl block mb-2"></i>Belum ada jenis konsekuensi.</td></tr>';
        return;
    }
    const objekBadge = { 'Laki-laki': 'bg-blue-100 text-blue-700', 'Perempuan': 'bg-pink-100 text-pink-700', 'Semua': 'bg-purple-100 text-purple-700' };
    const objekIcon = { 'Laki-laki': 'fa-mars', 'Perempuan': 'fa-venus', 'Semua': 'fa-venus-mars' };
    tbody.innerHTML = jenisKonsekuensiList.map(function(item, idx) {
        return '<tr class="hover:bg-gray-50 transition-colors border-b border-gray-100">' +
            '<td class="px-4 py-3 text-sm text-gray-500">' + (idx + 1) + '</td>' +
            '<td class="px-4 py-3 font-semibold text-gray-800">' + item.nama + '</td>' +
            '<td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ' + (objekBadge[item.objek] || 'bg-gray-100 text-gray-600') + '"><i class="fas ' + (objekIcon[item.objek] || 'fa-users') + '"></i> ' + item.objek + '</span></td>' +
            '<td class="px-4 py-3 text-right">' +
                '<button onclick="openEditKonsekuensiModal(\'' + item.id + '\')" class="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg font-bold transition mr-1"><i class="fas fa-pen"></i> Edit</button>' +
                '<button onclick="hapusJenisKonsekuensi(\'' + item.id + '\', \'' + item.nama + '\')" class="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg font-bold transition"><i class="fas fa-trash"></i> Hapus</button>' +
            '</td></tr>';
    }).join('');
}

function openTambahKonsekuensiModal() {
    document.getElementById('formKonsekuensiId').value = '';
    document.getElementById('formKonsekuensiNama').value = '';
    document.getElementById('formKonsekuensiObjek').value = 'Semua';
    document.getElementById('modalKonsekuensiTitle').textContent = 'Tambah Jenis Konsekuensi';
    document.getElementById('modalKonsekuensi').classList.remove('hidden');
}

function openEditKonsekuensiModal(id) {
    const item = jenisKonsekuensiList.find(function(k) { return k.id === id; });
    if (!item) return;
    document.getElementById('formKonsekuensiId').value = item.id;
    document.getElementById('formKonsekuensiNama').value = item.nama;
    document.getElementById('formKonsekuensiObjek').value = item.objek;
    document.getElementById('modalKonsekuensiTitle').textContent = 'Edit Jenis Konsekuensi';
    document.getElementById('modalKonsekuensi').classList.remove('hidden');
}

function closeModalKonsekuensi() { document.getElementById('modalKonsekuensi').classList.add('hidden'); }

async function submitFormKonsekuensi() {
    const id = document.getElementById('formKonsekuensiId').value;
    const nama = document.getElementById('formKonsekuensiNama').value.trim();
    const objek = document.getElementById('formKonsekuensiObjek').value;
    if (!nama) { Swal.fire('Peringatan', 'Nama konsekuensi wajib diisi!', 'warning'); return; }
    const btn = document.getElementById('btnSubmitKonsekuensi');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Menyimpan...'; btn.disabled = true;
    let res = id
        ? await fetchAPI('updateJenisKonsekuensi', { token: currentUser.token, id, nama, objek })
        : await fetchAPI('addJenisKonsekuensi', { token: currentUser.token, nama, objek });
    btn.innerHTML = origText; btn.disabled = false;
    if (res.success) {
        closeModalKonsekuensi();
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: res.message, timer: 1500, showConfirmButton: false });
        loadJenisKonsekuensi();
    } else { Swal.fire('Gagal', res.message, 'error'); }
}

async function hapusJenisKonsekuensi(id, nama) {
    const result = await Swal.fire({ title: 'Hapus Konsekuensi?', html: 'Jenis konsekuensi <strong>' + nama + '</strong> akan dihapus.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', cancelButtonColor: '#6B7280', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' });
    if (!result.isConfirmed) return;
    const res = await fetchAPI('deleteJenisKonsekuensi', { token: currentUser.token, id });
    if (res.success) { Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1200, showConfirmButton: false }); loadJenisKonsekuensi(); }
    else Swal.fire('Gagal', res.message, 'error');
}

// ---------- TAB 2: PETAKAN ----------
async function loadPetakanKonsekuensi() {
    hasilGenerateKonsekuensi = [];
    document.getElementById('hasilGenerateKonsekuensi').innerHTML = '';
    await Promise.all([loadSiswaTerlambatKons(), loadChecklistKonsekuensi()]);
}

async function loadSiswaTerlambatKons() {
    const container = document.getElementById('daftarSiswaTerlambatKons');
    container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-circle-notch fa-spin text-2xl"></i><p class="mt-2 text-sm">Memuat...</p></div>';
    const res = await fetchAPI('getSiswaTerlambatHariIni', { token: currentUser.token });
    if (!res.success) { container.innerHTML = '<p class="text-red-500 text-sm text-center py-4">Gagal: ' + res.message + '</p>'; return; }
    siswaTerlambatList = res.data || [];
    if (!siswaTerlambatList.length) {
        container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-check-circle text-4xl text-green-400 block mb-2"></i><p class="text-sm font-semibold">Tidak ada siswa terlambat hari ini!</p></div>';
        return;
    }
    const lakilaki = siswaTerlambatList.filter(function(s) { return s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('laki'); });
    const perempuan = siswaTerlambatList.filter(function(s) { return s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('perempuan'); });
    const rows = siswaTerlambatList.map(function(s) {
        const isLaki = s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('laki');
        return '<tr class="border-t border-gray-50 hover:bg-gray-50"><td class="px-3 py-2 font-semibold text-gray-800">' + s.nama + '</td><td class="px-3 py-2 text-gray-500 text-sm">' + s.kelas + '</td><td class="px-3 py-2 text-center"><span class="text-xs font-bold ' + (isLaki ? 'text-blue-600' : 'text-pink-600') + '"><i class="fas ' + (isLaki ? 'fa-mars' : 'fa-venus') + '"></i></span></td></tr>';
    }).join('');
    container.innerHTML = '<div class="flex gap-2 mb-3 text-xs font-bold"><span class="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full"><i class="fas fa-mars"></i> L: ' + lakilaki.length + '</span><span class="flex items-center gap-1 bg-pink-50 text-pink-700 px-2 py-1 rounded-full"><i class="fas fa-venus"></i> P: ' + perempuan.length + '</span><span class="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Total: ' + siswaTerlambatList.length + '</span></div><div class="overflow-y-auto max-h-72 border border-gray-100 rounded-xl"><table class="w-full text-sm"><thead class="bg-gray-50 sticky top-0"><tr><th class="px-3 py-2 text-left text-xs font-bold text-gray-500">Nama</th><th class="px-3 py-2 text-left text-xs font-bold text-gray-500">Kelas</th><th class="px-3 py-2 text-center text-xs font-bold text-gray-500">JK</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

async function loadChecklistKonsekuensi() {
    const container = document.getElementById('checklistKonsekuensiKons');
    container.innerHTML = '<div class="text-center py-6 text-gray-400"><i class="fas fa-circle-notch fa-spin"></i></div>';
    const res = await fetchAPI('getJenisKonsekuensi', { token: currentUser.token });
    if (!res.success) { container.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat.</p>'; return; }
    jenisKonsekuensiList = res.data || [];
    if (!jenisKonsekuensiList.length) { container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Belum ada jenis konsekuensi. Tambahkan di Tab 1.</p>'; return; }
    const objekBadge = { 'Laki-laki': 'bg-blue-100 text-blue-700', 'Perempuan': 'bg-pink-100 text-pink-700', 'Semua': 'bg-purple-100 text-purple-700' };
    const items = jenisKonsekuensiList.map(function(item) {
        return '<label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition"><input type="checkbox" id="checkKons_' + item.id + '" value="' + item.id + '" class="w-4 h-4 accent-indigo-600"><div class="flex-1"><p class="text-sm font-semibold text-gray-800">' + item.nama + '</p><span class="text-xs px-2 py-0.5 rounded-full font-bold ' + (objekBadge[item.objek] || 'bg-gray-100 text-gray-600') + '">' + item.objek + '</span></div></label>';
    }).join('');
    container.innerHTML = '<div class="flex items-center gap-2 mb-3"><button onclick="toggleAllKonsekuensi(true)" class="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold border border-indigo-200 transition">Pilih Semua</button><button onclick="toggleAllKonsekuensi(false)" class="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold border border-gray-200 transition">Hapus Pilihan</button></div><div class="space-y-2 max-h-72 overflow-y-auto pr-1">' + items + '</div>';
}

function toggleAllKonsekuensi(state) { document.querySelectorAll('[id^="checkKons_"]').forEach(function(cb) { cb.checked = state; }); }

function generateKonsekuensi() {
    if (!siswaTerlambatList.length) { Swal.fire('Info', 'Tidak ada siswa terlambat hari ini.', 'info'); return; }
    const checked = Array.from(document.querySelectorAll('[id^="checkKons_"]:checked')).map(function(cb) { return cb.value; });
    if (!checked.length) { Swal.fire('Peringatan', 'Pilih minimal 1 jenis konsekuensi.', 'warning'); return; }
    const konsekuensiAktif = jenisKonsekuensiList.filter(function(k) { return checked.includes(k.id); }).map(function(k) { return Object.assign({}, k, { siswa: [] }); });

    const poolLaki = siswaTerlambatList.filter(function(s) { return s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('laki'); });
    const poolPerempuan = siswaTerlambatList.filter(function(s) { return s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('perempuan'); });

    const konsBuatLaki = konsekuensiAktif.filter(function(k) { return k.objek === 'Laki-laki'; });
    const konsBuatPerempuan = konsekuensiAktif.filter(function(k) { return k.objek === 'Perempuan'; });
    const konsBuatSemua = konsekuensiAktif.filter(function(k) { return k.objek === 'Semua'; });

    function distribusi(pool, konsGroup) {
        if (!konsGroup.length || !pool.length) return;
        pool.forEach(function(siswa, idx) { konsGroup[idx % konsGroup.length].siswa.push(siswa); });
    }

    distribusi(poolLaki, konsBuatLaki);
    distribusi(poolPerempuan, konsBuatPerempuan);
    distribusi(siswaTerlambatList, konsBuatSemua);

    hasilGenerateKonsekuensi = konsekuensiAktif;
    renderHasilGenerate();
}

function renderHasilGenerate() {
    const container = document.getElementById('hasilGenerateKonsekuensi');
    if (!hasilGenerateKonsekuensi.length) { container.innerHTML = ''; return; }
    const objekColor = { 'Laki-laki': 'from-blue-500 to-blue-600', 'Perempuan': 'from-pink-500 to-pink-600', 'Semua': 'from-purple-500 to-purple-600' };
    const cards = hasilGenerateKonsekuensi.map(function(k, idx) {
        return '<div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">' +
            '<div class="bg-gradient-to-r ' + (objekColor[k.objek] || 'from-gray-400 to-gray-500') + ' p-4">' +
                '<div class="flex items-start justify-between">' +
                    '<div><p class="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">' + k.objek + '</p>' +
                    '<h5 class="text-white font-bold text-base">' + k.nama + '</h5></div>' +
                    '<span class="bg-white/25 text-white text-2xl font-black w-12 h-12 rounded-xl flex items-center justify-center">' + k.siswa.length + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="p-3 flex items-center justify-between">' +
                '<p class="text-xs text-gray-500">' + k.siswa.length + ' siswa ditugaskan</p>' +
                '<button onclick="lihatDetailKonsekuensi(' + idx + ')" class="inline-flex items-center gap-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg font-bold transition active:scale-95"><i class="fas fa-list"></i> Lihat Daftar</button>' +
            '</div>' +
        '</div>';
    }).join('');
    container.innerHTML = '<div class="mt-6 pt-6 border-t border-gray-200"><h4 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2"><i class="fas fa-check-circle text-green-500"></i> Hasil Generate Konsekuensi</h4><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">' + cards + '</div></div>';
}

function lihatDetailKonsekuensi(idx) {
    const item = hasilGenerateKonsekuensi[idx];
    if (!item) return;
    const rows = item.siswa.length
        ? item.siswa.map(function(s, i) {
            const isLaki = s.jenisKelamin && s.jenisKelamin.toLowerCase().includes('laki');
            return '<tr class="border-t border-gray-100"><td class="px-4 py-2 text-gray-400">' + (i+1) + '</td><td class="px-4 py-2 font-semibold text-gray-800">' + s.nama + '</td><td class="px-4 py-2 text-gray-500">' + s.kelas + '</td><td class="px-4 py-2 text-center"><span class="text-xs font-bold ' + (isLaki ? 'text-blue-600' : 'text-pink-600') + '"><i class="fas ' + (isLaki ? 'fa-mars' : 'fa-venus') + '"></i></span></td></tr>';
        }).join('')
        : '<tr><td colspan="4" class="text-center py-8 text-gray-400">Tidak ada siswa</td></tr>';
    Swal.fire({ title: item.nama, html: '<div class="text-left overflow-auto max-h-80 rounded-xl border border-gray-100"><table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="px-4 py-2 text-left text-xs font-bold text-gray-500">#</th><th class="px-4 py-2 text-left text-xs font-bold text-gray-500">Nama</th><th class="px-4 py-2 text-left text-xs font-bold text-gray-500">Kelas</th><th class="px-4 py-2 text-center text-xs font-bold text-gray-500">JK</th></tr></thead><tbody>' + rows + '</tbody></table></div>', showCloseButton: true, showConfirmButton: false, width: '600px' });
}

async function loadHalamanKonsekuensi() { 
    stopAndBack(false); 
    setActiveMenu('Konsekuensi Harian'); 
    showView('view-konsekuensi');
    switchKonsekuensiTab('jenis'); 
}
