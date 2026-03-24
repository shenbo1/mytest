import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as couchbase from 'couchbase';

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../../.env'), override: true });

interface User {
  id: string;
  email: string;
  phone: string;
  password: string;
  nickname: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  phone: string;
  address: string;
  description: string;
}

async function initUser(cluster: couchbase.Cluster) {
  const bucket = cluster.bucket(process.env.DATABASE_NAME);
  const collection = bucket.scope('users').collection('users');
  const users: User[] = [
    {
      id: 'user_admin',
      email: 'admin@hilton.com',
      phone: '13838383838',
      password: 'Admin@123',
      nickname: 'admin',
      role: 'admin',
    },
    {
      id: 'user_guest',
      email: 'guest@hilton.com',
      phone: '15656565656',
      password: 'Password@123',
      nickname: 'guest',
      role: 'user',
    },
  ];
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userId = user.id;

    await collection.insert(userId, {
      ...user,
      password: hashedPassword,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log('user data completed');
}

async function initRestaurant(cluster: couchbase.Cluster) {
  const bucket = cluster.bucket(process.env.DATABASE_NAME);
  const collection = bucket.scope('restaurants').collection('restaurants');

  const restaurants: Restaurant[] = [
    {
      id: 'hilton_hongkong',
      name: 'Hilton Hong Kong',
      phone: '15656565656',
      address: 'Hong Kong',
      description: 'Hong Kong is a great city',
    },
    {
      id: 'hilton_beijing',
      name: 'Hilton Beijing',
      phone: '15656565656',
      address: 'Beijing',
      description: 'Beijing is a great city',
    },
    {
      id: 'hilton_shanghai',
      name: 'Hotel Shanghai',
      phone: '15656565656',
      address: 'Shanghai',
      description: 'Shanghai is a great city',
    },
  ];

  for (const restaurant of restaurants) {
    const restaurantId = restaurant.id;
    await collection.insert(restaurantId, {
      ...restaurant,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log('restaurant completed');
}

async function init() {
  let cluster = null;
  try {
    console.log(' db seed started...');

    const requiredEnvVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_USER: process.env.DATABASE_USER,
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
      DATABASE_NAME: process.env.DATABASE_NAME,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        throw new Error(`Missing ${key} in environment variables`);
      }
    }

    cluster = await couchbase.connect(process.env.DATABASE_URL, {
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    });

    cluster.query('delete from `hilton`.`users`.`users`');
    cluster.query('delete from `hilton`.`restaurants`.`restaurants`');

    await initUser(cluster);
    await initRestaurant(cluster);
    console.log(' db seed completed!');
    process.exit(0);
  } catch (error) {
    console.error(' Error during database seeding:', error);
    process.exit(1);
  } finally {
    await cluster.close();
  }
}

// 执行脚本
init();
