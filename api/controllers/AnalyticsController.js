import Order from "../api/models/Order.model.js";
import Product from "../api/models/product.js";
import User from "../api/models/User.js";

// Helper functions
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

// Export functions (IMPORTANT CHANGE)
export const getOverview = async (req, res) => {
  try {
    const now        = new Date();
    const thisMonth  = startOfMonth(now);
    const lastMonth  = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const lastMonthEnd = startOfMonth(now);  // = start of this month
    const last30     = daysAgo(30);
    const last7      = daysAgo(7);
    const yesterday  = daysAgo(1);
 
    // ── Orders ──────────────────────────────────────────────────
    const [
      allOrders,
      thisMonthOrders,
      lastMonthOrders,
      todayOrders,
      yesterdayOrders,
    ] = await Promise.all([
      Order.find({}).lean(),
      Order.find({ createdAt: { $gte: thisMonth } }).lean(),
      Order.find({ createdAt: { $gte: lastMonth, $lt: lastMonthEnd } }).lean(),
      Order.find({ createdAt: { $gte: daysAgo(0) } }).lean(),
      Order.find({ createdAt: { $gte: yesterday, $lt: daysAgo(0) } }).lean(),
    ]);
 
    const activeOrders = allOrders.filter((o) => o.status !== "Cancelled");
 
    // Revenue computations
    const totalRevenue      = activeOrders.reduce((s, o) => s + (o.total || 0), 0);
    const thisMonthRevenue  = thisMonthOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
    const lastMonthRevenue  = lastMonthOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
    const todayRevenue      = todayOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
 
    const revenueGrowth = lastMonthRevenue > 0
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : null;
 
    // Order counts
    const pendingCount    = allOrders.filter((o) => o.status === "Pending").length;
    const processingCount = allOrders.filter((o) => o.status === "Processing").length;
    const shippedCount    = allOrders.filter((o) => o.status === "Shipped").length;
    const deliveredCount  = allOrders.filter((o) => o.status === "Delivered").length;
    const cancelledCount  = allOrders.filter((o) => o.status === "Cancelled").length;
 
    // Avg order value
    const avgOrderValue = activeOrders.length > 0
      ? Math.round(totalRevenue / activeOrders.length) : 0;
    const thisMonthActive = thisMonthOrders.filter((o) => o.status !== "Cancelled");
    const avgOrderValueThisMonth = thisMonthActive.length > 0
      ? Math.round(thisMonthRevenue / thisMonthActive.length) : 0;
 
    // Conversion + return rates
    const returnRate = activeOrders.length > 0
      ? ((cancelledCount / allOrders.length) * 100).toFixed(1) : "0";
 
    // ── Products ─────────────────────────────────────────────────
    const allProducts   = await Product.find({}).lean();
    const totalProducts = allProducts.length;
    const outOfStock    = allProducts.filter((p) => (p.stock || 0) === 0).length;
    const lowStock      = allProducts.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
 
    // Top products by reviews (or sales)
    const topProducts = [...allProducts]
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 5)
      .map((p) => ({
        _id: p._id, name: p.name, brand: p.brand,
        category: p.category, price: p.price,
        originalPrice: p.originalPrice,
        image: p.image || p.images?.[0],
        reviews: p.reviews || 0, rating: p.rating || 0,
        stock: p.stock,
      }));
 
    // Category breakdown from products
    const catMap = {};
    allProducts.forEach((p) => {
      const cat = p.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categories = Object.entries(catMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / totalProducts) * 100) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
 
    // Revenue by category from orders
    const catRevMap = {};
    allOrders.filter((o) => o.status !== "Cancelled").forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category || "Other";
        catRevMap[cat] = (catRevMap[cat] || 0) + ((item.price || 0) * (item.quantity || 1));
      });
    });
    const totalCatRev = Object.values(catRevMap).reduce((s, v) => s + v, 0) || 1;
    const categoryRevenue = Object.entries(catRevMap)
      .map(([cat, revenue]) => ({ cat, revenue, pct: Math.round((revenue / totalCatRev) * 100) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
 
    // ── Customers ────────────────────────────────────────────────
    const allUsers       = await User.find({}).lean();
    const totalCustomers = allUsers.length;
    const newThisMonth   = allUsers.filter((u) => new Date(u.createdAt) >= thisMonth).length;
    const newLastMonth   = allUsers.filter((u) => {
      const d = new Date(u.createdAt);
      return d >= lastMonth && d < lastMonthEnd;
    }).length;
    const customerGrowth = newLastMonth > 0
      ? (((newThisMonth - newLastMonth) / newLastMonth) * 100).toFixed(1) : null;
 
    // ── Monthly revenue for chart (last 12 months) ────────────────
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label      = monthStart.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const mOrders    = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d < monthEnd && o.status !== "Cancelled";
      });
      revenueByMonth.push({
        month:   label,
        revenue: mOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders:  mOrders.length,
      });
    }
 
    // ── Daily revenue last 30 days (for sparkline) ───────────────
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = daysAgo(i);
      const dayEnd   = daysAgo(i - 1);
      const dayOrd   = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd && o.status !== "Cancelled";
      });
      dailyRevenue.push({
        date:    dayStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: dayOrd.reduce((s, o) => s + (o.total || 0), 0),
        orders:  dayOrd.length,
      });
    }
 
    // ── Hourly orders today ───────────────────────────────────────
    const hourlyToday = Array.from({ length: 24 }, (_, h) => {
      const start = new Date(); start.setHours(h, 0, 0, 0);
      const end   = new Date(); end.setHours(h + 1, 0, 0, 0);
      const count = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= start && d < end;
      }).length;
      return { hour: `${h}:00`, orders: count };
    });
 
    // ── Customer satisfaction (avg rating from products) ─────────
    const ratedProducts = allProducts.filter((p) => p.rating > 0);
    const avgRating = ratedProducts.length > 0
      ? (ratedProducts.reduce((s, p) => s + (p.rating || 0), 0) / ratedProducts.length).toFixed(1)
      : "—";
 
    // ── Recent activity feed ──────────────────────────────────────
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 }).limit(10).lean();
 
    const recentActivity = recentOrders.map((o) => ({
      id:          String(o._id),
      type:        "order",
      label:       `Order #${String(o._id).slice(-6).toUpperCase()}`,
      customer:    o.address?.fullName || o.customerName || "Customer",
      status:      o.status,
      amount:      o.total || 0,
      time:        o.createdAt,
      paymentMethod: o.paymentMethod,
    }));
 
    res.json({
      // KPIs
      totalRevenue, thisMonthRevenue, lastMonthRevenue, todayRevenue,
      revenueGrowth,
      totalOrders: allOrders.length,
      activeOrders: activeOrders.length,
      pendingCount, processingCount, shippedCount, deliveredCount, cancelledCount,
      avgOrderValue, avgOrderValueThisMonth,
      returnRate,
      totalProducts, outOfStock, lowStock,
      totalCustomers, newThisMonth, newLastMonth, customerGrowth,
      avgRating,
      // Charts
      revenueByMonth,
      dailyRevenue,
      hourlyToday,
      categories,
      categoryRevenue,
      topProducts,
      recentActivity,
      // Computed metrics
      metrics: {
        conversionRate: `${((deliveredCount / Math.max(allOrders.length, 1)) * 100).toFixed(1)}%`,
        conversionRateTrend: revenueGrowth ? `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}%` : null,
        avgOrderValue: `₹${avgOrderValue.toLocaleString()}`,
        avgOrderValueTrend: null,
        returnRate: `${returnRate}%`,
        returnRateTrend: null,
        customerSatScore: avgRating !== "—" ? `${avgRating}/5` : "—",
        customerSatTrend: null,
      },
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const now    = new Date();
    const data   = [];
 
    const allOrders = await Order.find({ status: { $ne: "Cancelled" } }).lean();
 
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label      = monthStart.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const mOrders    = allOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d < monthEnd;
      });
      data.push({
        month:   label,
        revenue: mOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders:  mOrders.length,
        avgOrder: mOrders.length > 0
          ? Math.round(mOrders.reduce((s, o) => s + (o.total || 0), 0) / mOrders.length)
          : 0,
      });
    }
    res.json({ revenue: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const now    = new Date();
    const users  = await User.find({}).lean();
    const orders = await Order.find({}).lean();
 
    // Signups per month (last 6)
    const signupsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label      = monthStart.toLocaleString("en-IN", { month: "short" });
      const count      = users.filter((u) => {
        const d = new Date(u.createdAt);
        return d >= monthStart && d < monthEnd;
      }).length;
      signupsByMonth.push({ month: label, count });
    }
 
    // Orders per customer histogram
    const ordersByUser = {};
    orders.forEach((o) => {
      const uid = String(o.userId || o.user?._id || "anon");
      ordersByUser[uid] = (ordersByUser[uid] || 0) + 1;
    });
    const oneTime   = Object.values(ordersByUser).filter((n) => n === 1).length;
    const returning = Object.values(ordersByUser).filter((n) => n > 1).length;
 
    // Top customers by spend
    const spendByUser = {};
    orders.filter((o) => o.status !== "Cancelled").forEach((o) => {
      const uid = String(o.userId || o.user?._id || "anon");
      spendByUser[uid] = (spendByUser[uid] || 0) + (o.total || 0);
    });
 
    res.json({
      total:   users.length,
      signupsByMonth,
      oneTime, returning,
      retentionRate: users.length > 0 ? ((returning / users.length) * 100).toFixed(1) : "0",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    const orders   = await Order.find({ status: { $ne: "Cancelled" } }).lean();
 
    // Units sold per product from order items
    const soldMap = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const pid = String(item.product || item.productId || "");
        if (pid) soldMap[pid] = (soldMap[pid] || 0) + (item.quantity || 1);
      });
    });
 
    const enriched = products.map((p) => ({
      _id:          p._id,
      name:         p.name,
      brand:        p.brand,
      category:     p.category,
      price:        p.price,
      originalPrice:p.originalPrice,
      stock:        p.stock || 0,
      rating:       p.rating || 0,
      reviews:      p.reviews || 0,
      image:        p.image || p.images?.[0],
      unitsSold:    soldMap[String(p._id)] || 0,
      revenue:      (soldMap[String(p._id)] || 0) * (p.price || 0),
    })).sort((a, b) => b.unitsSold - a.unitsSold);
 
    const totalRevenue = enriched.reduce((s, p) => s + p.revenue, 0);
 
    res.json({
      products:     enriched.slice(0, 20),
      totalRevenue,
      outOfStock:   enriched.filter((p) => p.stock === 0).length,
      lowStock:     enriched.filter((p) => p.stock > 0 && p.stock <= 10).length,
      topSellers:   enriched.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};