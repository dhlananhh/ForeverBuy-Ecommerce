import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { products } from './assets.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!mongoURI || !dbName) {
  console.error("Vui lòng đảm bảo các biến môi trường MONGO_URI và DB_NAME đã được thiết lập trong tệp .env");
  process.exit(1);
}

const seedDatabase = async () => {
  let client;
  try {
    client = new MongoClient(mongoURI);
    console.log("Dang ket noi den MongoDB Atlas...");
    await client.connect();
    console.log("Da ket noi thanh cong den MongoDB Atlas!");

    const db = client.db(dbName);

    const productsCollection = db.collection('products');

    console.log("Dang don dep collection 'products'...");
    await productsCollection.deleteMany({});
    console.log("Collection da duoc don dep.");

    const processedProducts = products.map(product => {
      const { date, ...rest } = product;
      return {
        ...rest,
        image: product.image.length === 1 ? product.image[0] : product.image,
        createdAt: new Date(date),
      };
    });

    console.log(`Dang chen ${processedProducts.length} san pham vao collection...`);
    await productsCollection.insertMany(processedProducts);
    console.log("Da chen thanh cong toan bo du lieu san pham!");
    console.log(`Hoan tat! Du lieu da duoc seed thanh cong vao co so du lieu '${dbName}'.`);

  } catch (error) {
    console.error("Da xay ra loi trong qua trinh seed du lieu:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("Ket noi den MongoDB da duoc dong.");
    }
  }
};

seedDatabase();
