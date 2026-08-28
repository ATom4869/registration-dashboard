'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Send,
  MessageCircle,
  ShieldCheck,
  Zap,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Copy,
  Check,
  Download,
  Settings2,
  ExternalLink,
  HelpCircle,
  Database,
  Code,
  FileSpreadsheet,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Submission {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string;
  serviceCategory: string;
  notes: string;
  createdAt: string;
}

export default function LandingPage() {
  // Form State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Konsultasi Kebutuhan Proyek');
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<Submission | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGs, setCopiedGs] = useState(false);

  // Settings & Integrations
  const [webhookUrl, setWebhookUrl] = useState('');
  const [supportWaNumber, setSupportWaNumber] = useState('6281234567890');
  const [supportWaMessage, setSupportWaMessage] = useState(
    'Halo Admin, saya ingin menanyakan informasi lebih lanjut mengenai pendaftaran layanan.'
  );

  // Submissions local store
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);

  // Modals & Panels
  const [activeModal, setActiveModal] = useState<
    'none' | 'source_code' | 'sheets_guide' | 'mockup_text' | 'submissions' | 'settings'
  >('none');
  const [isWaPopupOpen, setIsWaPopupOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingMessage, setPingMessage] = useState('');

  // Load saved submissions and settings from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedSubs = localStorage.getItem('app_submissions');
        if (savedSubs) {
          setSubmissionsList(JSON.parse(savedSubs));
        }
        const savedWebhook = localStorage.getItem('app_webhook_url');
        if (savedWebhook) {
          setWebhookUrl(savedWebhook);
        }
        const savedWa = localStorage.getItem('app_support_wa');
        if (savedWa) {
          setSupportWaNumber(savedWa);
        }
      } catch {
        // Ignore localStorage read errors in restricted contexts
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save submissions to localStorage
  const saveSubmissionRecord = (newRecord: Submission) => {
    const updated = [newRecord, ...submissionsList];
    setSubmissionsList(updated);
    try {
      localStorage.setItem('app_submissions', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client validation
    if (!fullName.trim() || !whatsapp.trim() || !email.trim()) {
      setErrorMessage('Harap lengkapi semua kolom wajib (Nama, WhatsApp, dan Email).');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Harap centang persetujuan pemrosesan data untuk melanjutkan.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      serviceCategory,
      notes: notes.trim() || '-',
      webhookUrl: webhookUrl.trim(),
      source: 'Landing Page Pendaftaran',
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const record: Submission = {
          id: result.data.id || `REG-${Date.now().toString().slice(-6)}`,
          fullName: result.data.fullName,
          whatsapp: result.data.whatsapp,
          email: result.data.email,
          serviceCategory: result.data.serviceCategory,
          notes: result.data.notes,
          createdAt: result.data.createdAt || new Date().toISOString(),
        };

        setSubmittedData(record);
        saveSubmissionRecord(record);
        // Reset form input
        setFullName('');
        setWhatsapp('');
        setEmail('');
        setNotes('');
      } else {
        setErrorMessage(result.message || 'Gagal mengirim data. Silakan coba kembali.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kegagalan jaringan';
      setErrorMessage(`Terjadi kesalahan: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ping Webhook Test
  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      setPingStatus('failed');
      setPingMessage('Harap masukkan URL Webhook terlebih dahulu.');
      return;
    }

    setPingStatus('testing');
    setPingMessage('Mengirim data uji coba ke Webhook...');

    try {
      const testPayload = {
        fullName: 'Test User (Pengujian Sistem)',
        whatsapp: '+6281234567890',
        email: 'test@example.com',
        serviceCategory: 'Uji Coba Integrasi',
        notes: 'Pesan pengujian koneksi Webhook Google Sheets',
        webhookUrl: webhookUrl.trim(),
        source: 'Webhook Tester',
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setPingStatus('success');
        setPingMessage(resData.webhookMessage || 'Koneksi ke Webhook berhasil!');
      } else {
        setPingStatus('failed');
        setPingMessage(resData.message || 'Webhook gagal merespons.');
      }
    } catch (err: unknown) {
      setPingStatus('failed');
      const errTxt = err instanceof Error ? err.message : 'Network error';
      setPingMessage(`Gagal menghubungi Webhook: ${errTxt}`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (submissionsList.length === 0) return;
    const headers = ['ID', 'Nama Lengkap', 'WhatsApp', 'Email', 'Kategori Layanan', 'Catatan', 'Tanggal'];
    const rows = submissionsList.map((item) => [
      `"${item.id}"`,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${item.whatsapp.replace(/"/g, '""')}"`,
      `"${item.email.replace(/"/g, '""')}"`,
      `"${item.serviceCategory.replace(/"/g, '""')}"`,
      `"${item.notes.replace(/"/g, '""')}"`,
      `"${new Date(item.createdAt).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pendaftaran_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Standalone Single-File HTML Code for Deliverable #2
  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Landing Page Pendaftaran Layanan</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col justify-between selection:bg-blue-600 selection:text-white">

  <!-- ================= HEADER / NAVBAR ================= -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          P
        </div>
        <span class="font-bold text-lg tracking-tight text-slate-900">PortalPendaftaran</span>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#keunggulan" class="hover:text-blue-600 transition">Keunggulan</a>
        <a href="#form-section" class="hover:text-blue-600 transition">Formulir</a>
        <a href="#faq" class="hover:text-blue-600 transition">FAQ</a>
      </nav>
      <a href="#form-section" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">
        Daftar Sekarang
      </a>
    </div>
  </header>

  <!-- ================= HERO SECTION ================= -->
  <section class="py-14 sm:py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
        <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        Pendaftaran Resmi Periode 2026
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-6">
        Daftarkan Kebutuhan Anda dengan <span class="text-blue-600">Cepat & Terintegrasi</span>
      </h1>
      <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        Lengkapi formulir singkat di bawah ini. Tim kami akan segera meninjau data Anda dan memberikan respon serta konsultasi terarah dalam waktu kurang dari 15 menit.
      </p>
      
      <!-- Trust Points -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">⚡</div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">Respon Sangat Cepat</h4>
            <p class="text-xs text-slate-500 mt-0.5">Konfirmasi instan via WhatsApp & Email.</p>
          </div>
        </div>
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">🔒</div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">100% Data Aman</h4>
            <p class="text-xs text-slate-500 mt-0.5">Privasi terjamin & tersimpan rapi.</p>
          </div>
        </div>
        <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">✨</div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">Konsultasi Gratis</h4>
            <p class="text-xs text-slate-500 mt-0.5">Diskusi kebutuhan awal tanpa biaya.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= FORM SECTION ================= -->
  <section id="form-section" class="py-16 bg-slate-50">
    <div class="max-w-xl mx-auto px-4 sm:px-6">
      <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Formulir Pendaftaran</h2>
          <p class="text-sm text-slate-500 mt-1">Silakan lengkapi formulir dengan data yang valid.</p>
        </div>

        <!-- Notification Banner -->
        <div id="alertBox" class="hidden mb-6 p-4 rounded-xl text-sm"></div>

        <form id="registrationForm" class="space-y-5">
          <!-- Nama Lengkap -->
          <div>
            <label for="fullName" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Lengkap <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              placeholder="Contoh: Budi Pratama"
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <!-- WhatsApp -->
          <div>
            <label for="whatsapp" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor WhatsApp <span class="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              required
              placeholder="Contoh: 081234567890"
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <span class="text-[11px] text-slate-400 mt-1 block">Pastikan nomor terhubung dengan akun WhatsApp aktif.</span>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Alamat Email <span class="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Contoh: budi@gmail.com"
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <!-- Kebutuhan / Catatan -->
          <div>
            <label for="notes" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Kebutuhan / Catatan Khusus
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Tuliskan ringkasan kebutuhan atau pertanyaan Anda di sini..."
              class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
            ></textarea>
          </div>

          <!-- Persetujuan -->
          <div class="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="consent"
              checked
              required
              class="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <label for="consent" class="text-xs text-slate-600 leading-relaxed">
              Saya menyetujui data di atas digunakan untuk keperluan follow-up dan verifikasi pendaftaran.
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            id="submitBtn"
            class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span id="btnText">Kirim Pendaftaran Sekarang</span>
            <span id="btnSpinner" class="hidden w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          </button>
        </form>

        <!-- Success Result Card -->
        <div id="successCard" class="hidden mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
            <div>
              <h4 class="text-sm font-bold text-emerald-900">Pendaftaran Berhasil Dikirim!</h4>
              <p class="text-xs text-emerald-700">Nomor Registrasi: <span id="resId" class="font-mono font-bold"></span></p>
            </div>
          </div>
          <p class="text-xs text-emerald-800 mt-2">
            Terima kasih <span id="resName" class="font-semibold"></span>. Tim kami akan segera menghubungi nomor WhatsApp Anda.
          </p>
          <button onclick="resetForm()" class="mt-4 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950">
            Daftarkan entri baru
          </button>
        </div>

      </div>
    </div>
  </section>

  <!-- ================= FLOATING ACTION BUTTON (FAB) WHATSAPP ================= -->
  <!-- Target WhatsApp Service Desk: Ganti nomor WA & teks pesan di atribut href -->
  <div class="fixed bottom-6 right-6 z-50">
    <a
      id="fabWhatsapp"
      href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20menanyakan%20perihal%20pendaftaran%20layanan."
      target="_blank"
      rel="noopener noreferrer"
      class="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-105"
      aria-label="Hubungi WhatsApp Service Desk"
    >
      <!-- Online Pulse Badge -->
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
      
      <!-- WA Icon (SVG) -->
      <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.83.81 2.796.81h.005c3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.796-5.772-5.796zm3.38 8.174c-.145.409-.747.784-1.031.834-.286.05-.658.077-1.921-.446-1.579-.654-2.614-2.261-2.693-2.366-.079-.105-.644-.858-.644-1.637 0-.778.406-1.161.551-1.319.145-.158.316-.197.421-.197.105 0 .21.002.302.007.098.005.228-.037.356.27.132.316.45 1.096.489 1.175.039.079.066.171.013.276-.053.105-.079.171-.158.263-.079.092-.167.206-.239.276-.079.079-.161.164-.069.322.092.158.409.675.877 1.092.603.537 1.111.703 1.269.782.158.079.25.066.342-.039.092-.105.394-.46.5-.618.105-.158.21-.132.355-.079.145.053.92.434 1.078.513.158.079.263.118.302.184.039.066.039.381-.106.79z"/>
      </svg>
      <span class="font-semibold text-sm pr-1">Bantuan WA</span>
    </a>
  </div>

  <!-- ================= FOOTER ================= -->
  <footer class="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4">
      <p>© 2026 Portal Pendaftaran Resmi. Seluruh hak cipta dilindungi.</p>
    </div>
  </footer>

  <!-- ================= JAVASCRIPT LOGIC ================= -->
  <script>
    // MASUKKAN URL GOOGLE APPS SCRIPT / WEBHOOK ANDA DI SINI (JIKA ADA):
    const GOOGLE_SHEETS_WEBHOOK_URL = ''; 

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const alertBox = document.getElementById('alertBox');
    const successCard = document.getElementById('successCard');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Ambil data
      const fullName = document.getElementById('fullName').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const email = document.getElementById('email').value.trim();
      const notes = document.getElementById('notes').value.trim();

      if (!fullName || !whatsapp || !email) {
        showAlert('Harap lengkapi semua kolom wajib.', 'error');
        return;
      }

      // Format payload
      const regId = 'REG-' + Date.now().toString(36).toUpperCase();
      const payload = {
        id: regId,
        fullName: fullName,
        whatsapp: whatsapp,
        email: email,
        notes: notes || '-',
        timestamp: new Date().toISOString()
      };

      // Set UI Loading
      submitBtn.disabled = true;
      btnText.innerText = 'Mengirim Data...';
      btnSpinner.classList.remove('hidden');
      alertBox.classList.add('hidden');

      try {
        if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.startsWith('http')) {
          // Kirim ke Google Apps Script Webhook
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk Apps Script CORS
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        // Tampilkan Sukses
        form.classList.add('hidden');
        document.getElementById('resId').innerText = regId;
        document.getElementById('resName').innerText = fullName;
        successCard.classList.remove('hidden');

      } catch (err) {
        showAlert('Terjadi kesalahan koneksi saat mengirim data.', 'error');
      } finally {
        submitBtn.disabled = false;
        btnText.innerText = 'Kirim Pendaftaran Sekarang';
        btnSpinner.classList.add('hidden');
      }
    });

    function showAlert(msg, type) {
      alertBox.innerText = msg;
      alertBox.className = type === 'error' 
        ? 'mb-6 p-4 rounded-xl text-sm bg-rose-50 text-rose-700 border border-rose-200' 
        : 'mb-6 p-4 rounded-xl text-sm bg-emerald-50 text-emerald-700 border border-emerald-200';
      alertBox.classList.remove('hidden');
    }

    function resetForm() {
      form.reset();
      form.classList.remove('hidden');
      successCard.classList.add('hidden');
      alertBox.classList.add('hidden');
    }
  </script>
</body>
</html>`;

  // Google Apps Script Code for Deliverable #3
  const googleAppsScriptCode = `/**
 * GOOGLE APPS SCRIPT WEBHOOK UNTUK FORM PENDAFTARAN
 * Simpan script ini di: Google Sheets -> Extensions -> Apps Script
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Kunci eksekusi 30 detik untuk mencegah race condition
  lock.tryLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Buat Header otomatis di baris 1 jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID Pendaftaran", 
        "Nama Lengkap", 
        "Nomor WhatsApp", 
        "Email", 
        "Kategori Layanan", 
        "Kebutuhan / Catatan", 
        "Sumber",
        "Waktu Pendaftaran (WIB)"
      ]);
      
      // Styling header
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground("#2563EB");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
    }

    // Parse data JSON yang dikirimkan oleh form
    var data = JSON.parse(e.postData.contents);

    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "Asia/Jakarta", "dd-MM-yyyy HH:mm:ss");

    // Masukkan baris data baru ke spreadsheet
    sheet.appendRow([
      data.id || ("REG-" + now.getTime()),
      data.fullName || "-",
      "'" + (data.whatsapp || "-"), // Beri tanda petik satu agar angka 0 di depan tidak hilang
      data.email || "-",
      data.serviceCategory || "Umum",
      data.notes || "-",
      data.source || "Landing Page Form",
      formattedDate
    ]);

    // Berikan respons JSON sukses
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "success", 
        "message": "Data pendaftaran berhasil dicatat ke Google Sheets!" 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "error", 
        "message": error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("Endpoint Webhook Google Apps Script Pendaftaran Aktif.")
    .setMimeType(ContentService.MimeType.TEXT);
}`;

  // Copy helpers
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyGs = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2500);
  };

  // Download Standalone HTML
  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([standaloneHtmlCode], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'index.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              P
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                PortalPendaftaran
              </span>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Layanan & Konsultasi Resmi
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#keunggulan" className="hover:text-blue-600 transition">
              Keunggulan
            </a>
            <a href="#form-section" className="hover:text-blue-600 transition">
              Formulir
            </a>
            <a href="#faq" className="hover:text-blue-600 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Developer / Client Tools Dropdown */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-open-submissions"
                onClick={() => setActiveModal('submissions')}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                title="Lihat Data Masuk"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Data</span>
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {submissionsList.length}
                </span>
              </button>
              <button
                id="btn-open-settings"
                onClick={() => setActiveModal('settings')}
                className="px-2 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg transition flex items-center gap-1 cursor-pointer"
                title="Pengaturan Webhook & Kontak WA"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Integrasi</span>
              </button>
            </div>

            <a
              id="cta-nav-daftar"
              href="#form-section"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </header>

      {/* ================= HERO BANNER SECTION ================= */}
      <section id="hero-section" className="py-12 sm:py-16 bg-gradient-to-b from-white via-blue-50/25 to-slate-50 border-b border-slate-200/80 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Pendaftaran Layanan & Konsultasi 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-5"
          >
            Daftarkan Kebutuhan Anda dengan <span className="text-blue-600">Mudah, Cepat & Terarah</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Isi formulir pendaftaran di bawah ini untuk memulai sesi konsultasi. Data Anda langsung tercatat rapi ke sistem kami dan tim kami akan segera menghubungi Anda.
          </motion.p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <a
              id="hero-cta-form"
              href="#form-section"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2"
            >
              <span>Isi Formulir Pendaftaran</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              id="hero-cta-wa"
              href={`https://wa.me/${supportWaNumber}?text=${encodeURIComponent(supportWaMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp Langsung</span>
            </a>
          </div>

          {/* Quick Stats Badges */}
          <div id="keunggulan" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-2 text-left">
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Respon Sangat Cepat</h4>
                <p className="text-xs text-slate-500 mt-0.5">Konfirmasi dan follow-up dalam &lt; 15 menit.</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">100% Data Aman</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tersimpan rapi di Google Sheets & Database.</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Konsultasi Gratis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Analisis awal kebutuhan tanpa komitmen biaya.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= DEVELOPER & CLIENT QUICK TABS ================= */}
      <section className="bg-slate-100/70 border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-900">Aset Penyerahan Klien:</span>
            <span className="hidden sm:inline text-slate-500">Klik tab untuk melihat & menyalin kode deliverables</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal('source_code')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Source Code (HTML Single File)</span>
            </button>
            <button
              onClick={() => setActiveModal('sheets_guide')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:text-emerald-600 hover:border-emerald-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Panduan Google Sheets Webhook</span>
            </button>
            <button
              onClick={() => setActiveModal('mockup_text')}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mockup Struktur Teks</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= MAIN REGISTRATION FORM SECTION ================= */}
      <section id="form-section" className="py-14 sm:py-18 bg-slate-50 flex-1">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative">
            
            {/* Header Form */}
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Formulir Pendaftaran
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Harap isi formulir di bawah ini dengan data yang valid dan aktif.
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Success Card Confirmation */}
            {submittedData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-2 space-y-4"
              >
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-emerald-950">
                        Pendaftaran Berhasil Dikirim!
                      </h3>
                      <p className="text-xs text-emerald-700">
                        No. Registrasi:{' '}
                        <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                          {submittedData.id}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed pt-1">
                    Terima kasih <strong className="font-semibold text-emerald-950">{submittedData.fullName}</strong>. Data Anda telah berhasil tersimpan dan diteruskan ke tim representatif kami.
                  </p>

                  <div className="bg-white/90 p-3 rounded-lg border border-emerald-200/80 text-xs space-y-1 text-slate-700">
                    <div>
                      <span className="text-slate-500">Nomor WhatsApp:</span>{' '}
                      <span className="font-semibold">{submittedData.whatsapp}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Alamat Email:</span>{' '}
                      <span className="font-semibold">{submittedData.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kategori:</span>{' '}
                      <span className="font-semibold">{submittedData.serviceCategory}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <a
                    href={`https://wa.me/${supportWaNumber}?text=${encodeURIComponent(
                      `Halo Admin, saya baru saja mendaftar dengan ID: ${submittedData.id} atas nama ${submittedData.fullName}. Mohon informasinya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi Cepat via WA</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setErrorMessage('');
                    }}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Daftar Entri Baru</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <form id="registration-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Nama Lengkap */}
                <div>
                  <label htmlFor="field-fullName" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="field-fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Budi Pratama"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    />
                  </div>
                </div>

                {/* 2. Nomor WhatsApp */}
                <div>
                  <label htmlFor="field-whatsapp" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="field-whatsapp"
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890 atau +6281234567890"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tim kami akan mengirimkan konfirmasi & pesan follow-up melalui nomor ini.
                  </span>
                </div>

                {/* 3. Email */}
                <div>
                  <label htmlFor="field-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="field-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: budi@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    />
                  </div>
                </div>

                {/* 4. Kategori Layanan */}
                <div>
                  <label htmlFor="field-serviceCategory" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori Kebutuhan Layanan
                  </label>
                  <select
                    id="field-serviceCategory"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-slate-800"
                  >
                    <option value="Konsultasi Kebutuhan Proyek">Konsultasi Kebutuhan Proyek</option>
                    <option value="Pengembangan Website & Landing Page">Pengembangan Website & Landing Page</option>
                    <option value="Integrasi Sistem & Otomasi Data">Integrasi Sistem & Otomasi Data</option>
                    <option value="Pemasaran Digital & Solusi Bisnis">Pemasaran Digital & Solusi Bisnis</option>
                    <option value="Lainnya / Permintaan Kustom">Lainnya / Permintaan Kustom</option>
                  </select>
                </div>

                {/* 5. Kebutuhan / Catatan Tambahan */}
                <div>
                  <label htmlFor="field-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kebutuhan / Catatan Khusus
                  </label>
                  <textarea
                    id="field-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ceritakan gambaran kebutuhan, target waktu, atau rincian pertanyaan Anda..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white resize-none"
                  ></textarea>
                </div>

                {/* Checkbox Consent */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="field-agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="field-agreeTerms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                    Saya menyetujui data yang saya kirimkan digunakan untuk keperluan verifikasi dan tindak lanjut pendaftaran secara aman.
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  id="btn-submit-registration"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan & Meneruskan Data...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pendaftaran Sekarang</span>
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Micro Privacy Trust */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Koneksi aman SSL 256-bit • Tanpa spam</span>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Jawaban seputar proses pendaftaran dan tindak lanjut</p>
          </div>

          <div className="space-y-3 text-sm">
            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Berapa lama waktu respon setelah formulir dikirim?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tim representatif kami biasanya merespon dalam waktu 5 - 15 menit pada jam operasional (08.00 - 21.00 WIB) langsung ke nomor WhatsApp yang Anda daftarkan.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Apakah data pendaftaran saya langsung terhubung ke Google Sheets?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ya! Sistem ini telah dilengkapi modul Webhook yang siap menerima URL Google Apps Script Anda. Setiap entri formulir akan langsung otomatis menambah baris baru di spreadsheet Google Sheets secara real-time.
              </p>
            </details>

            <details className="group border border-slate-200 rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-50/50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                <span>Apakah saya bisa langsung berkonsultasi lewat WhatsApp?</span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tentu saja. Anda bisa mengklik tombol Floating WhatsApp di pojok kanan bawah kapan saja untuk terhubung langsung dengan Service Desk kami dengan pesan pembuka otomatis.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Portal Pendaftaran Resmi. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setActiveModal('source_code')} className="hover:text-blue-600 underline">
              Unduh Single-File HTML
            </button>
            <button onClick={() => setActiveModal('sheets_guide')} className="hover:text-blue-600 underline">
              Panduan Google Sheets
            </button>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING ACTION BUTTON (FAB) WHATSAPP ================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Expanded Quick Message Bubble Preview (Toggleable) */}
        <AnimatePresence>
          {isWaPopupOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-72 mb-1 text-xs text-slate-700"
            >
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-bold text-slate-900">Service Desk WhatsApp</span>
                </div>
                <button
                  onClick={() => setIsWaPopupOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-600 mb-3">
                Butuh bantuan pendaftaran langsung? Hubungi tim support kami sekarang via WhatsApp.
              </p>
              <a
                href={`https://wa.me/${supportWaNumber}?text=${encodeURIComponent(supportWaMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Buka Percakapan</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWaPopupOpen(!isWaPopupOpen)}
            className="hidden sm:inline-flex bg-white/90 backdrop-blur-xs text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border border-slate-200 hover:bg-white transition"
          >
            Tanya Layanan?
          </button>
          
          <a
            id="fab-whatsapp-btn"
            href={`https://wa.me/${supportWaNumber}?text=${encodeURIComponent(supportWaMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-full shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:scale-105"
            aria-label="Hubungi WhatsApp Service Desk"
          >
            {/* Online Pulse Indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>

            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="font-bold text-sm pr-1">Bantuan WA</span>
          </a>
        </div>
      </div>

      {/* ================= MODAL 1: FULL SOURCE CODE (HTML STANDALONE) ================= */}
      <AnimatePresence>
        {activeModal === 'source_code' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Full Source Code Standalone (Deliverable #2)
                    </h3>
                    <p className="text-xs text-slate-500">
                      HTML5 + Tailwind CSS CDN + Vanilla JavaScript dalam 1 file mandiri
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 flex-1 overflow-y-auto font-mono text-xs leading-relaxed">
                <pre className="whitespace-pre-wrap">{standaloneHtmlCode}</pre>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Dapat langsung disimpan sebagai <code className="font-bold text-slate-700">index.html</code> dan dibuka di browser.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHtml}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh index.html</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: GOOGLE SHEETS WEBHOOK GUIDE ================= */}
      <AnimatePresence>
        {activeModal === 'sheets_guide' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Panduan Integrasi Google Sheets Webhook (Deliverable #3)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cara mudah menyimpan data form otomatis ke Google Spreadsheet gratis tanpa backend
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700">
                
                {/* Step 1 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Buat Google Spreadsheet Baru
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> di browser Anda. Beri nama spreadsheet, misalnya <em>&quot;Database Pendaftaran Klien 2026&quot;</em>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Buka Apps Script & Salin Kode
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3">
                    Pada menu Google Sheets, klik <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>. Hapus isi file <code className="bg-slate-200 px-1 py-0.5 rounded">Code.gs</code> dan gantikan dengan script di bawah ini:
                  </p>
                  
                  <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
                    <button
                      onClick={handleCopyGs}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-sans flex items-center gap-1 cursor-pointer"
                    >
                      {copiedGs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedGs ? 'Tersalin' : 'Salin Script'}</span>
                    </button>
                    <pre className="whitespace-pre-wrap">{googleAppsScriptCode}</pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                    Deploy Sebagai Web App (Aplikasi Web)
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <li>Klik tombol biru <strong>Terapkan (Deploy)</strong> &rarr; <strong>Penerapan baru (New deployment)</strong>.</li>
                    <li>Pilih jenis: <strong>Aplikasi web (Web app)</strong>.</li>
                    <li>Deskripsi: <em>Endpoint Form Pendaftaran</em>.</li>
                    <li>Jalankan sebagai (Execute as): <strong>Saya (email Anda)</strong>.</li>
                    <li>Yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong>.</li>
                    <li>Klik <strong>Deploy</strong>, lalu berikan izin otorisasi akun Google.</li>
                    <li>Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berakhiran <code className="bg-slate-200 px-1 rounded text-slate-800">/exec</code>.</li>
                  </ol>
                </div>

                {/* Step 4 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                    Pasang URL ke Landing Page
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Tempelkan URL tersebut ke menu <strong>Integrasi & Settings</strong> di pojok kanan atas aplikasi ini, atau di variabel <code className="font-mono bg-slate-200 px-1 rounded">GOOGLE_SHEETS_WEBHOOK_URL</code> pada file HTML Anda.
                  </p>
                </div>

              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Tutup Panduan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: TEXT MOCKUP & CLIENT PROPOSAL ================= */}
      <AnimatePresence>
        {activeModal === 'mockup_text' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-indigo-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Mockup Struktur Visual & Deskripsi Klien (Deliverable #4)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Struktur teks rapi siap copy untuk presentasi ke klien
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs whitespace-pre overflow-x-auto">
{`+-------------------------------------------------------------------------+
| [LOGO] Portal Pendaftaran         [Keunggulan] [Formulir] [FAQ] [Daftar]|
+-------------------------------------------------------------------------+
|                                                                         |
|                DAFTARKAN KEBUTUHAN ANDA DENGAN CEPAT                    |
|   "Lengkapi formulir singkat untuk konsultasi dan solusi terbaik"       |
|                                                                         |
|        [ Tombol: Isi Formulir ]      [ Tombol: Chat WhatsApp ]          |
|                                                                         |
|   [⚡ Respon <15 Menit]       [🔒 100% Data Aman]     [✨ Konsultasi]   |
+-------------------------------------------------------------------------+
|                                                                         |
|   +----------------------- FORM PENDAFTARAN ------------------------+   |
|   | 1. Nama Lengkap       : [ Input: Nama Anda                    ] |   |
|   | 2. Nomor WhatsApp     : [ Input: 0812-xxxx-xxxx               ] |   |
|   | 3. Alamat Email       : [ Input: nama@email.com               ] |   |
|   | 4. Kategori Layanan   : [ Dropdown: Konsultasi / Website / ... ] |   |
|   | 5. Catatan Kebutuhan  : [ Textarea: Catatan spesifik          ] |   |
|   | [✓] Saya menyetujui pemrosesan data secara aman                 |   |
|   |                                                                 |   |
|   | [ TOMBOL: KIRIM PENDAFTARAN SEKARANG (Submit) ]                 |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   +-- (Setelah Submit Sukses) --------------------------------------+   |
|   | ✓ Pendaftaran Berhasil! [ID: REG-XXXXX]                         |   |
|   | Tim representatif akan menghubungi Anda via WhatsApp.           |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   [FAQ SECTION]                                                         |
|   - Berapa lama respon?                                                 |
|   - Ke mana data disimpan? (Google Sheets otomatis)                     |
|                                                                         |
+-------------------------------------------------------------------------+
| (c) 2026 Hak Cipta Dilindungi                      [ 🟢 Bantuan WA ]    |
|                                                    (Floating pojok kanan)|
+-------------------------------------------------------------------------+`}
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900">Poin Penting untuk Klien:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Kecepatan Loading Tinggi:</strong> Menggunakan arsitektur Single-File tanpa dependensi berat.</li>
                    <li><strong>Responsif Penuh:</strong> Tampilan rapi sempurna di smartphone Android, iPhone, tablet, dan desktop.</li>
                    <li><strong>Integrasi Fleksibel:</strong> Data form langsung masuk ke Google Sheets tanpa biaya server bulanan tambahan.</li>
                    <li><strong>Direct Support:</strong> Pengunjung bisa langsung menyapa admin melalui Floating WhatsApp Button dengan template pesan pembuka otomatis.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Tutup Mockup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 4: SUBMISSIONS DATA VIEWER ================= */}
      <AnimatePresence>
        {activeModal === 'submissions' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Data Pendaftaran Masuk ({submissionsList.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Entri formulir yang tercatat di sistem browser & API
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {submissionsList.length > 0 && (
                    <button
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModal('none')}
                    className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                {submissionsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Database className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-slate-600">Belum ada pendaftaran masuk</p>
                    <p className="text-xs text-slate-400 mt-1">Coba isi form di halaman utama untuk menguji pencatatan data.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="p-3">ID / Tanggal</th>
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">WhatsApp</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Kategori & Catatan</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700">
                        {submissionsList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="p-3">
                              <span className="font-mono font-bold text-blue-600 block">{item.id}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(item.createdAt).toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900">{item.fullName}</td>
                            <td className="p-3">
                              <a
                                href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {item.whatsapp}
                              </a>
                            </td>
                            <td className="p-3">{item.email}</td>
                            <td className="p-3">
                              <span className="inline-block bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-medium mb-1">
                                {item.serviceCategory}
                              </span>
                              <p className="text-slate-500 line-clamp-2">{item.notes}</p>
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Halo ${item.fullName}, terima kasih telah mendaftar dengan No: ${item.id}. Tim kami ingin mengonfirmasi kebutuhan Anda.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200"
                              >
                                Hubungi
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {submissionsList.length > 0 && (
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      if (confirm('Hapus seluruh riwayat pendaftaran lokal?')) {
                        setSubmissionsList([]);
                        localStorage.removeItem('app_submissions');
                      }
                    }}
                    className="text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua Data</span>
                  </button>
                  <span className="text-slate-500">Total: {submissionsList.length} data</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 5: SETTINGS & WEBHOOK CONFIG ================= */}
      <AnimatePresence>
        {activeModal === 'settings' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Pengaturan Integrasi & Call Center
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
                {/* Webhook Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Google Apps Script / Webhook Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => {
                      setWebhookUrl(e.target.value);
                      localStorage.setItem('app_webhook_url', e.target.value);
                    }}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    URL Web App dari deployment Google Apps Script (lihat tab Panduan Google Sheets).
                  </span>

                  {/* Webhook Tester button */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={handleTestWebhook}
                      disabled={pingStatus === 'testing'}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {pingStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Uji Koneksi Webhook</span>
                    </button>
                  </div>

                  {pingMessage && (
                    <div className={`mt-2 p-2.5 rounded-lg text-xs font-medium ${
                      pingStatus === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {pingMessage}
                    </div>
                  )}
                </div>

                {/* WhatsApp Support Number */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Service Desk (FAB)
                  </label>
                  <input
                    type="text"
                    value={supportWaNumber}
                    onChange={(e) => {
                      setSupportWaNumber(e.target.value);
                      localStorage.setItem('app_support_wa', e.target.value);
                    }}
                    placeholder="Contoh: 6281234567890 (Gunakan kode negara 62)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Nomor tujuan saat pengunjung mengklik Floating Button di pojok kanan bawah.
                  </span>
                </div>

                {/* Custom Default Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Pesan Otomatis WhatsApp
                  </label>
                  <input
                    type="text"
                    value={supportWaMessage}
                    onChange={(e) => setSupportWaMessage(e.target.value)}
                    placeholder="Halo Admin, saya ingin bertanya..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Simpan & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
