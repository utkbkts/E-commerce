import catchAsyncError from "../middleware/catchAsyncError.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import ErrorHandler from "../utils/errorHandler.js";

// `getAnalyticsData` fonksiyonu, analitik verileri toplamak için kullanılır.
// Bu veriler, toplam kullanıcı sayısı, toplam ürün sayısı, toplam satış sayısı ve toplam gelir içerir.
const getAnalyticsData = catchAsyncError(async () => {
  // Toplam kullanıcı sayısını hesaplar.
  // `User` modelinden tüm belgelerin sayısını alır.
  const totalUsers = await User.countDocuments();

  // Toplam ürün sayısını hesaplar.
  // `Product` modelinden tüm belgelerin sayısını alır.
  const totalProducts = await Product.countDocuments();

  // Satış verilerini toplar.
  // `Order` modelinde `aggregate` kullanarak verileri gruplar ve toplam satış sayısı ile toplam geliri hesaplar.
  const salesData = await Order.aggregate([
    {
      // Gruplama aşaması
      $group: {
        _id: null, // Tüm belgeleri tek bir grup olarak toplar
        totalSales: { $sum: 1 }, // Toplam satış sayısını hesaplar (her belgeyi 1 olarak sayar)
        totalRevenue: { $sum: "$totalAmount" }, // Toplam geliri hesaplar (her belgedeki `totalAmount` alanını toplar)
      },
    },
  ]);

  // `salesData` dönen veri, bir dizi içerir. İlk (ve tek) elemanı alırız.
  // Eğer veri yoksa, varsayılan değerler kullanılır.
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // Toplanan verileri döner.
  // Toplam kullanıcı sayısı, toplam ürün sayısı, toplam satış sayısı ve toplam gelir verilerini içerir.
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
});

// `getDailySalesData` fonksiyonu, belirli bir tarih aralığı için günlük satış verilerini toplar.
// Bu veriler günlük satış sayısını ve günlük geliri içerir.
const getDailySalesData = catchAsyncError(async (startDate, endDate) => {
  // `Order` koleksiyonunda, belirlenen tarih aralığında oluşturulmuş siparişleri filtreler.
  const dailySalesData = await Order.aggregate([
    {
      // Tarih aralığını filtreleme aşaması
      $match: {
        createdAt: {
          $gte: new Date(startDate), // Başlangıç tarihinden büyük veya eşit
          $lte: new Date(endDate), // Bitiş tarihinden küçük veya eşit
        },
      },
    },
    {
      // Günlük verileri toplama aşaması
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Tarihi YYYY-MM-DD formatında grupla
        sales: { $sum: 1 }, // Günlük toplam satış sayısını hesapla (her siparişi 1 olarak sayar)
        revenue: { $sum: "$totalAmount" }, // Günlük toplam geliri hesapla (`totalAmount` alanını topla)
      },
    },
    { $sort: { _id: 1 } }, // Tarihe göre artan sırada sıralama
  ]);

  // Tarih aralığı içindeki tüm günleri içeren bir dizi oluşturur.
  const dateArray = getDatesInRange(startDate, endDate);

  // Tarih dizisini kullanarak günlük satış ve gelir verilerini oluşturur.
  return dateArray.map((date) => {
    // Günlük verilerden mevcut tarihi bulur.
    const foundData = dailySalesData.find((item) => item._id === date);

    // Bulunan verilerle bir nesne oluşturur. Eğer veri yoksa, satış ve gelir sıfır olarak atanır.
    return {
      date,
      sales: foundData?.sales || 0, // Günün satış sayısı (veri bulunmazsa 0)
      revenue: foundData?.revenue || 0, // Günün geliri (veri bulunmazsa 0)
    };
  });
});

// `getDatesInRange` fonksiyonu, belirtilen başlangıç ve bitiş tarihleri arasındaki tüm günleri içeren bir dizi döndürür.
function getDatesInRange(startDate, endDate) {
  const dates = []; // Tarihleri depolamak için bir dizi
  let currentDate = new Date(startDate); // Başlangıç tarihinden başla

  // Bitiş tarihine kadar her günü ekler
  while (currentDate <= endDate) {
    // Tarihi YYYY-MM-DD formatında diziye ekler
    dates.push(currentDate.toISOString().split("T")[0]);
    // Bir sonraki güne geçer
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates; // Tarih dizisini döndürür
}

const getSales = catchAsyncError(async (req, res, next) => {
  const analyticsData = await getAnalyticsData();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dailySalesData = await getDailySalesData(startDate, endDate);

  res.json({
    analyticsData,
    dailySalesData,
  });
});

export default { getSales };
