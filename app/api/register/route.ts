import { NextRequest, NextResponse } from 'next/server';

export interface RegistrationPayload {
  id?: string;
  fullName: string;
  whatsapp: string;
  email: string;
  serviceCategory?: string;
  notes: string;
  source?: string;
  createdAt?: string;
  webhookUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegistrationPayload = await req.json();

    // Validation
    if (!body.fullName || !body.whatsapp || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Harap isi semua data wajib (Nama, WhatsApp, Email).' },
        { status: 400 }
      );
    }

    const submissionId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const formattedData = {
      id: submissionId,
      fullName: body.fullName.trim(),
      whatsapp: body.whatsapp.trim(),
      email: body.email.trim().toLowerCase(),
      serviceCategory: body.serviceCategory || 'Konsultasi Umum',
      notes: body.notes ? body.notes.trim() : '-',
      source: body.source || 'Landing Page Form',
      createdAt: timestamp,
    };

    let webhookStatus = 'not_configured';
    let webhookMessage = '';

    // If webhookUrl is provided by user/settings, forward the payload to Google Apps Script / Webhook
    if (body.webhookUrl && body.webhookUrl.startsWith('http')) {
      try {
        const webhookResponse = await fetch(body.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });

        if (webhookResponse.ok) {
          webhookStatus = 'success';
          webhookMessage = 'Data berhasil diteruskan ke Webhook / Google Sheets.';
        } else {
          webhookStatus = 'failed';
          webhookMessage = `Webhook merespons dengan status ${webhookResponse.status}`;
        }
      } catch (err: unknown) {
        webhookStatus = 'error';
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        webhookMessage = `Gagal menghubungi Webhook: ${errMsg}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil dikirim!',
      data: formattedData,
      webhookStatus,
      webhookMessage,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json(
      { success: false, message: errMsg },
      { status: 500 }
    );
  }
}
