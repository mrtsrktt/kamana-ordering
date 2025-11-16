import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderNumber, businessName, businessType, deliveryOption, deliveryDate, phone, email, address, items, subtotal, notes, timestamp } = req.body;

  // İşletme türü etiketlerini düzenle
  const businessTypeLabels: { [key: string]: string } = {
    'cafe': 'Cafe',
    'restoran': 'Restoran',
    'pastane': 'Pastane',
    'yemek-sirketi': 'Yemek Şirketi',
    'diger': 'Diğer'
  };
  const businessTypeLabel = businessTypeLabels[businessType] || businessType;

  // Teslimat tarihini formatla
  const formatDeliveryDate = () => {
    const date = new Date(deliveryDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formattedDate = date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (deliveryOption === 'today') {
      return `Bugün (${formattedDate})`;
    } else if (deliveryOption === 'tomorrow') {
      return `Yarın (${formattedDate})`;
    } else {
      return formattedDate;
    }
  };

  const deliveryDateFormatted = formatDeliveryDate();

  // Email HTML içeriği - Dengeli fiş formatı
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @media print {
          body { margin: 0; padding: 10px; }
          .no-print { display: none; }
        }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.5; 
          color: #333; 
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .store-name {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
        }
        .order-title {
          font-size: 13px;
          color: #6b7280;
          margin-top: 5px;
        }
        .order-date {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 8px;
        }
        .total-box {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: #fff;
          text-align: center;
          padding: 14px;
          margin: 15px auto;
          border-radius: 8px;
          max-width: 200px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .total-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
          margin-bottom: 6px;
        }
        .total-amount {
          font-size: 26px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .info-section {
          background: #f9fafb;
          padding: 22px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .info-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-row {
          display: flex;
          margin: 10px 0;
          font-size: 15px;
        }
        .label {
          font-weight: 600;
          color: #4b5563;
          min-width: 100px;
        }
        .value {
          color: #1f2937;
          flex: 1;
          font-weight: 500;
        }
        .items-section {
          margin: 25px 0;
        }
        .items-title {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .items-table th {
          background: #f3f4f6;
          padding: 10px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #4b5563;
          border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .product-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
        }
        .product-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }
        .product-qty {
          text-align: center;
          font-weight: 500;
          color: #1f2937;
        }
        .product-price {
          text-align: right;
          color: #6b7280;
          font-size: 13px;
        }
        .product-total {
          text-align: right;
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
        }
        .notes-section {
          background: #fef3c7;
          padding: 15px;
          margin: 20px 0;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
          font-size: 13px;
        }
        .notes-title {
          font-weight: bold;
          color: #92400e;
          margin-bottom: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          font-size: 12px;
          color: #9ca3af;
        }
        .print-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          margin: 20px auto;
          display: block;
          font-size: 14px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <div class="store-name">KAMANA PASTANESİ</div>
        <div class="order-title">Toptan Sipariş Fişi</div>
        <div style="background: #C27C5B; color: white; padding: 12px; border-radius: 8px; margin: 15px 0; display: inline-block;">
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">SİPARİŞ NO</div>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${orderNumber}</div>
        </div>
        <div class="order-date">
          ${new Date(timestamp).toLocaleString('tr-TR', { 
            day: '2-digit',
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div class="total-box">
        <div class="total-label">Sipariş Tutarı</div>
        <div class="total-amount">${subtotal.toFixed(2)} TL</div>
      </div>

      <div class="info-section">
        <div class="info-title">Müşteri Bilgileri</div>
        <div class="info-row">
          <span class="label">İşletme:</span>
          <span class="value">${businessName}</span>
        </div>
        <div class="info-row">
          <span class="label">İşletme Türü:</span>
          <span class="value">${businessTypeLabel}</span>
        </div>
        <div class="info-row">
          <span class="label">Teslimat Günü:</span>
          <span class="value">${deliveryDateFormatted}</span>
        </div>
        <div class="info-row">
          <span class="label">Telefon:</span>
          <span class="value">${phone}</span>
        </div>
        <div class="info-row">
          <span class="label">Adres:</span>
          <span class="value">${address}</span>
        </div>
      </div>

      <div class="items-section">
        <div class="items-title">Sipariş Detayları</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th style="width: 200px;">Ürün Adı</th>
              <th style="text-align: center;">Miktar</th>
              <th style="text-align: right;">Birim Fiyat</th>
              <th style="text-align: right;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any) => `
              <tr>
                <td>
                  <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" class="product-img" />
                </td>
                <td class="product-name">${item.name}</td>
                <td class="product-qty">${item.quantity}</td>
                <td class="product-price">${item.price} TL</td>
                <td class="product-total">${(item.price * item.quantity).toFixed(2)} TL</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${notes ? `
        <div class="notes-section">
          <div class="notes-title">📝 Teslimat Notu</div>
          <div>${notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Bu fiş otomatik olarak oluşturulmuştur.</p>
        <p>Müşteri ile iletişim için yukarıdaki telefonu kullanabilirsiniz.</p>
      </div>

      <button class="print-button no-print" onclick="window.print()">🖨️ Yazdır</button>
    </body>
    </html>
  `;

  try {
    // Gmail SMTP kullanarak email gönder
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // Admin'e email gönder
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'muratsurkit@gmail.com',
      subject: `🎂 Yeni Sipariş #${orderNumber} - ${businessName} (${subtotal.toFixed(2)} TL)`,
      html: emailHtml
    });

    console.log('✅ Admin email başarıyla gönderildi:', businessName);

    // Müşteriye de email gönder (eğer email varsa)
    if (email && email.trim()) {
      const customerEmailHtml = emailHtml.replace(
        'Toptan Sipariş Fişi',
        'Sipariş Onay Fişi'
      ).replace(
        'Bu fiş otomatik olarak oluşturulmuştur.',
        'Siparişiniz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.'
      );

      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: `✅ Sipariş Onayı #${orderNumber} - Kamana Pastanesi`,
        html: customerEmailHtml
      });

      console.log('✅ Müşteri email başarıyla gönderildi:', email);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order received and emails sent'
    });
  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);
    
    // Email gönderilemese bile siparişi kabul et
    res.status(200).json({ 
      success: true, 
      message: 'Order received but email failed',
      error: 'Email could not be sent'
    });
  }
}
