import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { OrderStatus, DeliveryType, PaymentType } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    
    // Generate order code
    const orderCode = `ORD-${Date.now()}`;
    
    // Siparişi Postgres'e kaydet
    const order = await prisma.order.create({
      data: {
        code: orderCode,
        customerName: orderData.businessName,
        customerPhone: orderData.phone,
        customerEmail: orderData.email || null,
        address: orderData.address,
        addressDescription: orderData.notes || null,
        deliveryType: orderData.deliveryOption === 'asap' ? DeliveryType.ASAP : DeliveryType.SCHEDULED,
        deliveryTimeText: orderData.deliveryDate,
        paymentType: PaymentType.CASH,
        totalAmount: orderData.subtotal,
        status: OrderStatus.NEW
      }
    });

    res.status(200).json({ success: true, message: 'Order saved', order });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Error saving order' });
  }
}
