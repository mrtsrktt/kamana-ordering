import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        OrderItem: {
          include: {
            Product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match frontend expectations
    const transformedOrders = orders.map(order => ({
      orderNumber: order.code,
      businessName: order.customerName,
      businessType: 'cafe', // Default since new schema doesn't have this
      phone: order.customerPhone,
      email: order.customerEmail,
      address: order.address,
      deliveryDate: order.deliveryTimeText || '',
      deliveryOption: order.deliveryType === 'ASAP' ? 'asap' : 'scheduled',
      items: order.OrderItem.map(item => ({
        id: item.productId,
        name: item.productNameSnapshot,
        quantity: item.quantity,
        price: item.unitPriceSnapshot
      })),
      subtotal: order.totalAmount,
      notes: order.addressDescription || '',
      status: order.status.toLowerCase(),
      timestamp: order.createdAt.toISOString(),
      createdAt: order.createdAt.toISOString(),
      adminNotes: order.addressDescription || ''
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
}
