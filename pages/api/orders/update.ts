import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderNumber, status, adminNotes } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ message: 'Order number required' });
    }

    // Siparişi güncelle
    const order = await prisma.order.updateMany({
      where: { orderNumber },
      data: {
        status: status || undefined,
        ...(adminNotes !== undefined && { notes: adminNotes })
      }
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
}
