document.addEventListener('DOMContentLoaded', () => {
    const formJadwal = document.getElementById('form-jadwal');
    const tanggalInput = document.getElementById('tanggal-input');
    const jamInput = document.getElementById('jam-input');
    const aktivitasInput = document.getElementById('aktivitas-input');
    const deskripsiInput = document.getElementById('deskripsi-input');
    const listJadwal = document.getElementById('list-jadwal');
    const tanggalHariIniEl = document.getElementById('tanggal-hari-ini');
    const judulDaftarJadwal = document.getElementById('judul-daftar-jadwal');
    const toastElement = document.getElementById('jadwalToast');
    const toastBody = document.getElementById('toastBodyContent');
    const toast = new bootstrap.Toast(toastElement);
    const dropdownRiwayat = document.getElementById('dropdownRiwayat');

    const getTodayISO = () => {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const todayWithOffset = new Date(today.getTime() - (offset * 60 * 1000));
        return todayWithOffset.toISOString().split('T')[0];
    };

    let jadwal = JSON.parse(localStorage.getItem('delyJadwal')) || [];
    let selectedDate = getTodayISO();

    const tampilkanTanggal = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const hariIni = new Date();
        tanggalHariIniEl.textContent = hariIni.toLocaleDateString('id-ID', options);
    };

    const formatTanggalJudul = (tanggalString) => {
        const [year, month, day] = tanggalString.split('-').map(Number);
        const tanggalObj = new Date(year, month - 1, day);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return tanggalObj.toLocaleDateString('id-ID', options);
    };

    const simpanJadwal = () => {
        localStorage.setItem('delyJadwal', JSON.stringify(jadwal));
    };

    const renderJadwal = () => {
        const todayISO = getTodayISO(); 
        const formattedDate = formatTanggalJudul(selectedDate);

        judulDaftarJadwal.textContent = (selectedDate === todayISO)
            ? `Jadwal Hari Ini (${formattedDate})`
            : `Jadwal untuk ${formattedDate}`;

        listJadwal.innerHTML = '';
        const jadwalUntukTanggalTerpilih = jadwal.filter(item => item.tanggal === selectedDate);
        jadwalUntukTanggalTerpilih.sort((a, b) => a.jam.localeCompare(b.jam));

        if (jadwalUntukTanggalTerpilih.length === 0) {
            listJadwal.innerHTML = '<li>Belum ada jadwal untuk tanggal ini.</li>';
            return;
        }

        jadwalUntukTanggalTerpilih.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('jadwal-item');
            listItem.setAttribute('data-id', item.id);
            const deskripsiHtml = item.deskripsi ? `<p class="deskripsi">${item.deskripsi}</p>` : '';
            listItem.innerHTML = `
                <div class="info">
                    <span class="jam">${item.jam}</span>
                    <span class="aktivitas">${item.aktivitas}</span>
                    ${deskripsiHtml}
                </div>
                <div class="actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">❌</button>
                </div>
            `;
            listJadwal.appendChild(listItem);
        });
    };

    const renderRiwayat = () => {
        dropdownRiwayat.innerHTML = '<li><strong class="dropdown-header">Riwayat Jadwal</strong></li>';

        const semuaJadwal = [...jadwal];
        semuaJadwal.sort((a, b) => {
            const dateTimeA = `${a.tanggal}T${a.jam}`;
            const dateTimeB = `${b.tanggal}T${b.jam}`;
            return dateTimeB.localeCompare(dateTimeA);
        });

        if (semuaJadwal.length === 0) {
            dropdownRiwayat.innerHTML += '<li><small class="dropdown-item text-muted">Belum ada riwayat.</small></li>';
            return;
        }

        semuaJadwal.forEach(item => {
            dropdownRiwayat.innerHTML += `
                <li>
                    <span class="dropdown-item">
                        <strong>${item.jam}</strong> - ${item.aktivitas}
                        <small>${item.tanggal}</small>
                    </span>
                </li>
            `;
        });
    };

    const tambahJadwal = (e) => {
        e.preventDefault();
        const tanggal = tanggalInput.value;
        const jam = jamInput.value;
        const aktivitas = aktivitasInput.value.trim();
        const deskripsi = deskripsiInput.value.trim();

        if (aktivitas === '' || jam === '' || tanggal === '') {
            alert('Tanggal, jam, dan aktivitas tidak boleh kosong!');
            return;
        }

        const jadwalBaru = {
            id: Date.now(),
            tanggal: tanggal,
            jam: jam,
            aktivitas: aktivitas,
            deskripsi: deskripsi
        };

        jadwal.push(jadwalBaru);
        simpanJadwal();
        selectedDate = tanggal;
        tanggalInput.value = selectedDate;
        renderJadwal();
        renderRiwayat();
        formJadwal.reset();
        tanggalInput.value = selectedDate;
        jamInput.focus();
    };

    const hapusJadwal = (id) => {
        jadwal = jadwal.filter(item => item.id !== id);
        simpanJadwal();
        renderJadwal();
        renderRiwayat();
    };

    const editJadwal = (id) => {
        const itemUntukDiedit = jadwal.find(item => item.id === id);
        if (!itemUntukDiedit) return;
        tanggalInput.value = itemUntukDiedit.tanggal;
        jamInput.value = itemUntukDiedit.jam;
        aktivitasInput.value = itemUntukDiedit.aktivitas;
        deskripsiInput.value = itemUntukDiedit.deskripsi || '';
        hapusJadwal(id);
    };

    const handleListClick = (e) => {
        const target = e.target;
        const listItem = target.closest('.jadwal-item');
        if (!listItem) return;

        const id = Number(listItem.getAttribute('data-id'));

        if (target.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
                hapusJadwal(id);
            }
        }

        if (target.classList.contains('edit-btn')) {
            editJadwal(id);
        }
    };

    const handleDateChange = (e) => {
        selectedDate = e.target.value;
        renderJadwal();

        const jadwalUntukNotifikasi = jadwal
            .filter(item => item.tanggal === selectedDate)
            .sort((a, b) => a.jam.localeCompare(b.jam));

        if (jadwalUntukNotifikasi.length > 0) {
            const daftarAktivitasHtml = '<ul class="list-unstyled mb-0">' + 
                jadwalUntukNotifikasi.map(item => `<li><strong>${item.jam}</strong>: ${item.aktivitas}</li>`).join('') + 
                '</ul>';
            toastBody.innerHTML = daftarAktivitasHtml;
        } else {
            toastBody.innerHTML = 'Tidak ada jadwal untuk hari ini.';
        }

        toast.show();
    };

    const init = () => {
        tampilkanTanggal();
        tanggalInput.value = selectedDate;
        renderJadwal();
        renderRiwayat();
        formJadwal.addEventListener('submit', tambahJadwal);
        listJadwal.addEventListener('click', handleListClick);
        tanggalInput.addEventListener('change', handleDateChange);
    };

    init();
});

// Registrasi service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker berhasil didaftarkan dengan scope: ', registration.scope);
            })
            .catch(error => {
                console.log('Pendaftaran ServiceWorker gagal: ', error);
            });
    });
}
