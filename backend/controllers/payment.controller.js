import catchAsyncError from "../middleware/catchAsyncError.js";
import Coupon from "../models/coupon.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import { stripe } from "../utils/stripe.js";

// Stripe Checkout oturumu oluşturma fonksiyonu
const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const { products, couponCode } = req.body; // Ürünler ve kupon kodunu istekten al

  // Ürünlerin geçerli olup olmadığını kontrol et
  if (!Array.isArray(products) || products.length === 0) {
    return next(new ErrorHandler("Invalid or empty products", 404)); // Geçersiz ürünler hatası
  }

  let totalAmount = 0; // Toplam tutarı hesaplamak için değişken

  // Stripe ödeme satırlarını oluştur
  const lineItems = products.map((product) => {
    const amount = Math.round(product.price * 100); // Ürünün fiyatını kuruş cinsine çevir (Stripe kuruş birimini kullanır)
    totalAmount += amount * (product.quantity || 1); // Toplam tutarı güncelle

    return {
      price_data: {
        currency: "usd", // Ödeme para birimi
        product_data: {
          name: product.name, // Ürün adı
          images: [product.image], // Ürün resmi
        },
        unit_amount: amount, // Ürün fiyatı kuruş olarak
      },
      quantity: product.quantity || 1, // Ürün miktarı (varsayılan olarak 1)
    };
  });

  let coupon = null;
  if (couponCode) {
    // Kupon kodunu veritabanında ara
    coupon = await Coupon.findOne({
      code: couponCode, // Kupon kodu
      user: req.user._id, // Kullanıcı ID'si
      isActive: true, // Kupon aktif mi?
    });

    // Eğer geçerli bir kupon bulunursa, indirim uygulaması
    if (coupon) {
      totalAmount -= Math.round(
        (totalAmount * coupon.discountPercentage) / 100 // Kupon indirim yüzdesini toplam tutardan düş
      );
    }
  }

  // Stripe checkout oturumu oluştur
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], // Kredi kartı ödeme yöntemi
    line_items: lineItems, // Satır öğeleri (ürünler)
    mode: "payment", // Ödeme modu
    success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`, // Başarılı ödeme URL'si
    cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`, // İptal edilen ödeme URL'si
    discounts: coupon
      ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] // Eğer kupon varsa, indirim uygula
      : [],
    metadata: {
      user: req.user._id.toString(), // Kullanıcı ID'si (metadatalarda saklanır)
      couponCode: couponCode || "", // Kupon kodu (eğer varsa)
    },
  });

  // Yeni kupon oluştur ve kullanıcıya ata
  await createNewCoupon(req.user._id);

  // Stripe oturum ID'si ve toplam tutarı yanıt olarak gönder
  res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
});

// Stripe kuponu oluşturma fonksiyonu
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage, // İndirim yüzdesi
    duration: "once", // Kuponun tek seferlik kullanım süresi
  });

  return coupon.id; // Kupon ID'sini döndür
}

// Kullanıcıya özel yeni bir kupon oluşturma fonksiyonu
async function createNewCoupon(user) {
  // Eğer kullanıcıya ait eski bir kupon varsa, onu sil
  await Coupon.findOneAndDelete({ user });

  // Yeni bir kupon oluştur
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(), // Rastgele kupon kodu
    discountPercentage: 10, // %10 indirim
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün geçerlilik süresi
    user: user, // Kullanıcı ID'si
  });

  await newCoupon.save(); // Yeni kuponu veritabanına kaydet

  return newCoupon; // Yeni kuponu döndür
}

const checkoutSuccess = catchAsyncError(async (req, res) => {
  const { sessionId } = req.body; // İstekten gelen Stripe oturum ID'sini al

  // Stripe oturumunu sessionId kullanarak al
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Eğer ödeme durumu "paid" ise (ödeme başarılıysa)
  if (session.payment_status === "paid") {
    // Eğer ödeme sırasında bir kupon kullanılmışsa
    if (session.metadata.couponCode) {
      // Kuponu veritabanında bul ve aktifliğini (isActive) false yaparak devre dışı bırak
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode, // Kullanılan kupon kodu
          user: session.metadata.user, // Kuponu kullanan kullanıcı ID'si
        },
        {
          isActive: false, // Kuponu devre dışı bırak
        }
      );
    }

    // Yeni bir sipariş oluştur
    const products = JSON.parse(session.metadata.products); // Oturumdan gelen ürünleri JSON formatına çevir
    const newOrder = new Order({
      user: session.metadata.user, // Kullanıcı ID'si
      products: products.map((product) => ({
        product: product.id, // Ürün ID'si
        quantity: product.quantity, // Ürün miktarı
        price: product.price, // Ürün fiyatı
      })),
      totalAmount: session.amount_total / 100, // Toplam tutarı kuruşlardan dolara çevir
      stripeSessionId: sessionId, // Stripe oturum ID'si
    });

    // Yeni siparişi veritabanına kaydet
    await newOrder.save();

    // Başarılı yanıt dön: ödeme başarılı, sipariş oluşturuldu ve kupon devre dışı bırakıldı
    res.status(200).json({
      success: true,
      message:
        "Payment successful, order created, and coupon deactivated if used.", // Başarılı ödeme ve sipariş mesajı
      orderId: newOrder._id, // Yeni siparişin ID'si
    });
  }
});

export default { createCheckoutSession, checkoutSuccess }; // Fonksiyonu dışa aktar
