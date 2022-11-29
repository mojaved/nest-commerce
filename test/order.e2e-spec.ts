// import axios from 'axios';
// import { HttpStatus } from '@nestjs/common';
// import { HttpModule } from '@nestjs/axios';
import * as mongoose from 'mongoose';
import { RegisterDTO } from 'src/auth/auth.dto';
import { CreateProductDTO } from 'src/product/product.dto';
import { Product } from 'src/types/product';
import * as request from 'supertest';
import { app, database } from './constants';

beforeAll(async () => {
  await mongoose.connect(database);
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

const orderSeller: RegisterDTO = {
  seller: true,
  username: 'orderSeller',
  password: 'password',
};
const orderBuyer: RegisterDTO = {
  seller: false,
  username: 'orderBuyer',
  password: 'password',
};
let boughtProducts: Product[];
const soldProducts: CreateProductDTO[] = [
  {
    title: 'new phone',
    image: 'n/a',
    description: 'description',
    price: 10,
  },
  {
    title: 'new camera',
    image: 'n/a',
    description: 'description',
    price: 50,
  },
];

let sellerToken: string;
let buyerToken: string;

describe('ORDER', () => {
  it('should create order of all products', async () => {
    const seller = await request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(orderSeller)
      .expect(({ body }) => {
        sellerToken = body.token;
      });
    const buyer = await request(app)
      .post('/auth/register')
      .set('Accept', 'application/json')
      .send(orderBuyer)
      .expect(({ body }) => {
        buyerToken = body.token;
      });

    const [data1, data2] = await Promise.all(
      soldProducts.map((product) => postProducts(product, sellerToken)),
    );
    boughtProducts = [data1 as Product, data2 as Product];

    const orderDTO = {
      products: boughtProducts.map((product) => ({
        product: product._id,
        quantity: 1,
      })),
    };

    return request(app)
      .post('/order')
      .set('Authorization', `Bearer ${buyerToken}`)
      .set('Accept', 'application/json')
      .send(orderDTO)
      .expect(({ body }) => {
        expect(body.owner.username).toEqual(orderBuyer.username);
        expect(body.products.length).toEqual(boughtProducts.length);
        expect(
          boughtProducts
            .map((product) => product._id)
            .includes(body.products[0].product._id),
        ).toBeTruthy();
        expect(body.totalPrice).toEqual(
          boughtProducts.reduce((acc, i) => acc + i.price, 0),
        );
      })
      .expect(201);
  });
});

it('should list all orders of buyer', () => {
  return request(app)
    .get('/order')
    .set('Authorization', `Bearer ${buyerToken}`)
    .expect(({ body }) => {
      expect(body.length).toEqual(1);
      expect(body[0].products.length).toEqual(boughtProducts.length);
      expect(
        boughtProducts
          .map((product) => product._id)
          .includes(body[0].products[0].product._id),
      ).toBeTruthy();
      expect(body[0].totalPrice).toEqual(
        boughtProducts.reduce((acc, i) => acc + i.price, 0),
      );
    })
    .expect(200);
});

function postProducts(product, sellerToken) {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/product')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send(product)
      .end(onResponse);
    function onResponse(err, res) {
      if (err) return reject(err);
      // console.log(res);
      // boughtProducts.push(res.body);
      resolve(res.body);
    }
  });
}
