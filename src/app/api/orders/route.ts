import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateOrderNumber, generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, shippingMethod, paymentMethod, couponCode, notes } = body;

    if (!items?.length || !customer?.fullName || !customer?.phone || !customer?.governorate || !customer?.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sqlite = (db as any).$client;

    // Begin transaction
    const result = sqlite.transaction(() => {
      // 1. Validate stock and calculate prices server-side
      let subtotal = 0;
      const orderItems: any[] = [];

      for (const item of items) {
        const variant = sqlite.prepare(
          'SELECT pv.*, p.name_ar, p.name_en, p.price as product_price, p.sale_price, p.sku as product_sku FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = ? AND pv.is_active = 1'
        ).get(item.variantId);

        if (!variant) {
          throw new Error(`Variant ${item.variantId} not found`);
        }

        const available = variant.quantity_on_hand - variant.quantity_reserved;
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.name_en} (${variant.size}/${variant.color_name_en}). Available: ${available}`);
        }

        const unitPrice = variant.price_override || variant.sale_price || variant.product_price;
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          id: generateId(),
          productId: variant.product_id,
          variantId: variant.id,
          productNameSnapshot: `${variant.name_en} / ${variant.name_ar}`,
          skuSnapshot: variant.sku || variant.product_sku,
          variantInfoSnapshot: JSON.stringify({ size: variant.size, color: variant.color_name_en, colorAr: variant.color_name_ar }),
          unitPrice,
          discount: 0,
          quantity: item.quantity,
          total: itemTotal,
        });
      }

      // 2. Validate and apply coupon
      let discountAmount = 0;
      let couponId = null;
      if (couponCode) {
        const coupon = sqlite.prepare(
          "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)"
        ).get(couponCode, Date.now(), Date.now());

        if (coupon) {
          if (coupon.total_limit && coupon.usage_count >= coupon.total_limit) {
            // Coupon exhausted, skip silently
          } else if (coupon.min_order_value && subtotal < coupon.min_order_value) {
            // Below minimum, skip
          } else {
            couponId = coupon.id;
            if (coupon.type === 'percentage') {
              discountAmount = Math.round(subtotal * coupon.value / 100);
              if (coupon.max_discount && discountAmount > coupon.max_discount) {
                discountAmount = coupon.max_discount;
              }
            } else if (coupon.type === 'fixed') {
              discountAmount = coupon.value;
            }
          }
        }
      }

      // 3. Calculate shipping
      let shippingFee = 0;
      const zone = sqlite.prepare(
        "SELECT * FROM shipping_zones WHERE governorates LIKE ? AND is_active = 1 LIMIT 1"
      ).get(`%${customer.governorate}%`);

      if (zone) {
        shippingFee = zone.shipping_fee;
        if (zone.free_shipping_threshold && (subtotal - discountAmount) >= zone.free_shipping_threshold) {
          shippingFee = 0;
        }
      } else {
        shippingFee = 6000; // Default 60 EGP
      }

      // Free shipping coupon
      if (couponId) {
        const coupon = sqlite.prepare("SELECT type FROM coupons WHERE id = ?").get(couponId);
        if (coupon?.type === 'free_shipping') {
          shippingFee = 0;
          discountAmount = 0;
        }
      }

      const total = subtotal - discountAmount + shippingFee;

      // 4. Create order
      const orderId = generateId();
      const orderNumber = generateOrderNumber();
      const now = Date.now();

      sqlite.prepare(`
        INSERT INTO orders (id, order_number, user_id, guest_email, guest_phone, status, payment_status, payment_method,
          subtotal, discount_amount, shipping_fee, tax_amount, total, coupon_id,
          customer_name, customer_phone, customer_email, shipping_governorate, shipping_city, shipping_address,
          shipping_building, shipping_instructions, shipping_method, customer_notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId, orderNumber, null, customer.email || null, customer.phone,
        paymentMethod || 'cod',
        subtotal, discountAmount, shippingFee, total, couponId,
        customer.fullName, customer.phone, customer.email || null,
        customer.governorate, customer.city || '', customer.address,
        customer.building || '', customer.deliveryInstructions || '',
        shippingMethod || 'standard', notes || '', now, now
      );

      // 5. Create order items
      for (const item of orderItems) {
        sqlite.prepare(`
          INSERT INTO order_items (id, order_id, product_id, variant_id, product_name_snapshot, sku_snapshot,
            variant_info_snapshot, unit_price, discount, quantity, total, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(item.id, orderId, item.productId, item.variantId, item.productNameSnapshot, item.skuSnapshot,
          item.variantInfoSnapshot, item.unitPrice, item.discount, item.quantity, item.total, now);
      }

      // 6. Reserve stock
      for (const item of items) {
        sqlite.prepare(
          'UPDATE product_variants SET quantity_reserved = quantity_reserved + ? WHERE id = ?'
        ).run(item.quantity, item.variantId);

        sqlite.prepare(`
          INSERT INTO inventory_movements (id, variant_id, type, quantity, reference_type, reference_id, notes, created_at)
          VALUES (?, ?, 'reservation', ?, 'order', ?, 'Stock reserved for order', ?)
        `).run(generateId(), item.variantId, -item.quantity, orderId, now);
      }

      // 7. Record order status history
      sqlite.prepare(`
        INSERT INTO order_status_history (id, order_id, old_status, new_status, reason, created_at)
        VALUES (?, ?, NULL, 'pending', 'Order placed', ?)
      `).run(generateId(), orderId, now);

      // 8. Update coupon usage
      if (couponId) {
        sqlite.prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?').run(couponId);
        sqlite.prepare(`
          INSERT INTO coupon_redemptions (id, coupon_id, order_id, discount_amount, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(generateId(), couponId, orderId, discountAmount, now);
      }

      return {
        orderId,
        orderNumber,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        paymentMethod: paymentMethod || 'cod',
      };
    })();

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 400 });
  }
}
