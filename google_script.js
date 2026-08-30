// CARA PENGGUNAAN:
// 1. Buka Google Sheets baru, beri nama "Data Absensi"
// 2. Buat sheet dengan nama "LogAbsen"
// 3. Di baris pertama (A1 sampai F1), ketikkan Header: Tanggal | Waktu | Nama Guru | Kelas | Status | Lokasi
// 4. Klik menu Extensions (Ekstensi) > Apps Script
// 5. Hapus semua kode di sana, lalu PASTE kode di bawah ini:
// 6. Klik Deploy > New Deployment. 
// 7. Pilih tipe "Web App", akses "Anyone" (Siapa saja). 
// 8. Copy "Web app URL" dan masukkan ke dalam file config.js di project Anda.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LogAbsen");
  
  if (typeof e !== 'undefined' && e.postData !== 'undefined') {
    var data = JSON.parse(e.postData.contents);
    var date = data.date;
    var time = data.time;
    var name = data.name;
    var kelas = data.kelas || "-";
    var status = data.status || "Hadir";
    var lokasi = data.lokasi || "Lokasi tidak diketahui";
    
    // Tambahkan baris baru ke Google Sheet
    sheet.appendRow([date, time, name, kelas, status, lokasi]);
    
    return ContentService.createTextOutput(JSON.stringify({
      "status": "success", 
      "message": "Absen berhasil dicatat!"
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    "status": "error", 
    "message": "Data tidak valid"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LogAbsen");
  var data = sheet.getDataRange().getValues();
  
  // Ambil request parameter 'date' (jika ada)
  var requestedDate = e.parameter.date;
  
  var result = [];
  // Mulai dari i=1 untuk melewati header
  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][0];
    
    // Jika ada filter tanggal, dan tidak cocok, lewati
    if (requestedDate && rowDate !== requestedDate) {
      continue;
    }
    
    result.push({
      date: rowDate,
      time: data[i][1],
      name: data[i][2],
      kelas: data[i][3] || "-",
      status: data[i][4] || "Datang",
      lokasi: data[i][5] || "Tidak ada data lokasi"
    });
  }
  
  // Balik urutan agar yang terbaru di atas
  result.reverse();
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
