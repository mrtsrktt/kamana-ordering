import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderNumber, orderCode, status, adminNotes } = req.body;
    
    const code = orderCode || orderNumber;

    if (!code) {
      return res.status(400).json({ message: 'Order code required' });
    }

    // Map old status to new enum
    let newStatus: OrderStatus | undefined;
    if (status) {
      const statusMap: Record<string, OrderStatus> = {
        'pending': OrderStatus.NEW,
        'confirmed': OrderStatus.PREPARING,
        'preparing': OrderStatus.PREPARING,
        'on_the_way': OrderStatus.ON_THE_WAY,
        'delivered': OrderStatus.DELIVERED,
        'cancelled': OrderStatus.CANCELLED
      };
      newStatus = statusMap[status] || OrderStatus.NEW;
    }

    // Siparişi güncelle
    const order = await prisma.order.updateMany({
      where: { code },
      data: {
        status: newStatus || undefined,
        ...(adminNotes !== undefined && { addressDescription: adminNotes })
      }
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
}
