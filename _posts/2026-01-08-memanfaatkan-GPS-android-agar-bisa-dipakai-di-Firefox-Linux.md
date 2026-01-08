---
title: "Memanfaatkan GPS Android agar bisa dipakai di Firefox Linux"
layout: post
categories: Linux
toc: true
---
Saat bepergian, GPS menjadi alat yang sangat dibutuhkan. Namun, tidak semua PC atau Laptop memiliki GPS sebagai dukungan bawaan. Oleh karena itu pada postingan ini saya akan memberitahu anda cara memanfaatkan GPS ponsel Android agar dapat digunakan di browser Firefox pada sistem operasi Linux.


### Tools 
Tools yang kita butuhkan untuk menggunakan GPS android di firefox laptop adalah netcat, socat, geoclue2, gpsdRelay disisi ponsel android, dan terakhir tentu saja Firefox.

gpsdRelay ini memungkinkan anda untuk menggunakan GPS di laptop, dengan memanfaatkan GPS yang tersedia di ponsel android anda. Aplikasi ini mengirimkan data GPS dari ponsel android lewat TCP atau UDP.

netcat digunakan untuk hampir semua hal yang berkaitan dengan TCP atau UDP. Dalam konteks ini ia digunakan untuk listening raw data secara arbitrary, simplenya untuk mengecek NMEA stream apakah sudah diterima atau tidak.

socat adalah alat perantara yang fleksibel dan serbaguna. Tujuannya untuk membangun hubungan antara dua sumber data, di mana setiap sumber data dapat berupa File, Socket Unix, UDP, TCP, atau input standar. Socat ini kita gunakan untuk Forwarding NMEA stream dari TCP ke Socket Unix.

geoclue2 adalah layanan geoinformasi modular yang dibangun di atas D-Bus messaging system. geoclue2 akan mengambil data NMEA yang sudah diforward ke Socket Unix.

Firefox adalah web browser yang kita gunakan, karena ia memiliki geoclue2 backend sebagai dukungan bawaan dan kita tinggal mengaktifkannya saja di halaman about\:config.

### Instalasi
buka terminal, dan paste perintah ini

instalasi di Void
```
sudo xbps-install netcat socat geoclue2 firefox
```
instalasi di Debian
```
sudo apt install netcat socat geoclue-2.0 firefox
```
untuk gpsdRelay kamu bisa download [disini](https://f-droid.org/en/packages/io.github.project_kaat.gpsdrelay/) lalu install di ponsel android

### Konfigurasi gpsdRelay di android
1. Buka aplikasi gpsdRelay
2. Tekan tombol + di pojok kanan bawah
3. Pilih TCP server
4. Masukan Port yang akan anda gunakan (Misal: 2947) dan biarkan konfigurasi lainnya tetap seperti itu
5. Tekan tombol 'add'
6. Tekan toggle untuk mengaktifkan server
7. Tekan tombol ▶ untuk menjalankan gpsdRelay

### Konfigurasi geoclue2
buka konfigurasi geoclue di "/etc/geoclue/geoclue.conf" menggunakan teks editor yang kalian gunakan, disini saya pake nano, jadi:
```
sudo nano /etc/geoclue/geoclue.conf
```
nanti akan muncul tampilan seperti ini
```
# Whitelist of desktop IDs (without .desktop part) of all agents we recognise,
# separated by a ';'.
whitelist=geoclue-demo-agent;gnome-shell;io.elementary.desktop.agent-geoclue2;sm.puri.Phosh;lipstick;firefox

# Network NMEA source configuration options
[network-nmea]

# Fetch location from NMEA sources on local network?
enable=true

# use a nmea unix socket as the data source
nmea-socket=/var/run/gps-share.sock
```
tambahkan firefox di whitelist, set lokasi socket unix-nya di variable nmea-socket, lalu pastikan enable \[network-nmea\]-nya true.

selanjutnya buka firefox
1. buka about\:config
2. Tekan tombol 'Accept the Risk and Continue'
3. cari dengan kata kunci 'geo.' di search bar
4. pastikan geo.enabled = true
5. pastikan geo.provider.use_geoclue = true
6. close tab

### Forward NMEA stream ke Socket Unix
sebelum di forward alangkah baiknya kita cek terlebih dulu koneksi NMEA-nya menggunakan nc (netcat) apakah sudah terhubung atau tidak.

usage:
```
nc [IP_ADDRESS] [PORT]
```
contoh:
```
nc 192.168.100.1 2947
```

jika output tidak kosong itu artinya koneksi NMEA sudah terhubung, selanjutnya kita forward koneksi NMEA ke Socket Unix menggunakan socat

usage:
```
socat -u TCP:[IP_ADDRESS]:[PORT] UNIX-LISTEN:[FILE],fork,reuseaddr,mode=666
```
contoh:
```
socat -u TCP:192.168.100.1:2947 UNIX-LISTEN:/var/run/gps-share.sock,fork,reuseaddr,mode=666
```

**keterangan**

*-u*: adalah unidirectional stream, maksudnya stream berjalan satu arah dari argumen ke-1 ke argumen ke-2.

*TCP*: adalah argumen dimana koneksi NMEA datang.

*unix-listen*: adalah argumen yang mendengar (listen) argumen pertama.

*reuseaddr*: untuk merestart server secara langsung setelah crash ato koneksi terputus.

*fork*: untuk membuat fork child agar nantinya server bisa diakses oleh banyak client.

*mode=666*: diset agar user, group, dan other dapat melakukan read dan write ke socket unix secara bebas, jika tidak diset firefox tidak bisa menerima NMEA stream dari Socket Unix.

**note***
jika socat mengirim msg: 'broken pipe', tetapi koneksi NMEA masih terhubung dan bisa dipakai, abaikan saja, itu hanyak Packet Loss atau masalah Latency

### FAQ
Q: kenapa lewat socket unix?

A: karena geoclue2 tidak bisa mengakses koneksi NMEA langsung dari TCP tanpa bantuan third-party

### References
- [https://serverspace.us/articles/usage-netcat-for-test-tcp-udp/](https://serverspace.us/articles/usage-netcat-for-test-tcp-udp/)
- [https://www.baeldung.com/linux/socat-command](https://www.baeldung.com/linux/socat-command)
- [https://man.archlinux.org/man/geoclue.5](https://man.archlinux.org/man/geoclue.5)
- [https://whatismyipaddress.com/enabling-and-disabling-geolocation-on-your-browser](https://whatismyipaddress.com/enabling-and-disabling-geolocation-on-your-browser)
