import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import orderService from '../services/orderService.js';
import notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants.js';

/**
 * Admin Dashboard Statistics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      salesAgg
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.PROCESSING }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.SHIPPED }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED }),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      Product.countDocuments({ isActive: true }),
      Product.find({ isActive: true, stock: { $lte: 15 } })
        .select('name slug stock price image category')
        .limit(10),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('user', 'name email phone'),
      // Calculate total paid sales
      Order.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, totalSales: { $sum: '$total' }, totalTax: { $sum: '$tax' } } }
      ])
    ]);

    const totalSales = salesAgg.length > 0 ? salesAgg[0].totalSales : 0;

    // Aggregated sales over last 30 days for dashboard charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesOverTime = await Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.PAID,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailySales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: 'Admin dashboard metrics fetched successfully',
      data: {
        metrics: {
          totalSales,
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          completedOrders: deliveredOrders,
          cancelledOrders,
          totalCustomers,
          totalProducts,
          lowStockCount: lowStockProducts.length
        },
        lowStockProducts,
        recentOrders,
        salesOverTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List & Search all customer orders
 */
export const getAdminOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      status,
      paymentStatus,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const searchTerm = (search || '').trim();
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      query.$or = [
        { orderNumber: regex },
        { 'shippingAddress.fullName': regex },
        { 'shippingAddress.phone': regex },
        { 'shippingAddress.email': regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email phone'),
      Order.countDocuments(query)
    ]);

    return successResponse(res, {
      statusCode: 200,
      message: 'Orders fetched successfully',
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get single order with complete details
 */
export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('user', 'name email phone');

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Order details fetched successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update order fulfillment status
 * Strictly controls order lifecycle without allowing arbitrary payment status forgery
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, estimatedDelivery, notes } = req.body;

    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Invalid order status. Must be one of: ${Object.values(ORDER_STATUS).join(', ')}`,
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (carrier || trackingNumber || estimatedDelivery) {
      order.trackingInfo = {
        carrier: carrier || order.trackingInfo?.carrier,
        trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber,
        shippedAt: status === ORDER_STATUS.SHIPPED ? new Date() : order.trackingInfo?.shippedAt,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : order.trackingInfo?.estimatedDelivery
      };
    }

    if (notes) {
      order.notes = notes;
    }

    // If order was cancelled by admin, restore reserved stock
    if (status === ORDER_STATUS.CANCELLED && previousStatus !== ORDER_STATUS.CANCELLED) {
      await orderService.restoreStock(order.items);
      order.cancelledAt = new Date();
    }

    await order.save();

    console.log(`📦 [Admin] Order #${order.orderNumber} status updated from ${previousStatus} -> ${status}`);

    // If order was marked as shipped, send dispatch tracking email
    if (status === ORDER_STATUS.SHIPPED && previousStatus !== ORDER_STATUS.SHIPPED) {
      notificationService
        .sendOrderDispatched({
          order,
          customer: {
            name: order.shippingAddress?.fullName,
            email: order.shippingAddress?.email
          },
          carrier: order.trackingInfo?.carrier,
          trackingNumber: order.trackingInfo?.trackingNumber
        })
        .catch(notifErr => console.warn('⚠️  Dispatch notification warning:', notifErr.message));
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Order #${order.orderNumber} status updated to ${status}`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
