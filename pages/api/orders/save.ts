import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    
    // Siparişi Postgres'e kaydet
    const order = await prisma.order.create({
      data: {
        orderNumber: orderData.orderNumber,
        businessName: orderData.businessName,
        businessType: orderData.businessType,
        phone: orderData.phone,
        email: orderData.email || null,
        address: orderData.address,
        deliveryDate: orderData.deliveryDate,
        deliveryOption: orderData.deliveryOption,
        items: orderData.items,
        subtotal: orderData.subtotal,
        notes: orderData.notes || null,
        status: 'pending'
      }
    });

    res.status(200).json({ success: true, message: 'Order saved', order });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Error saving order' });
  }
}
