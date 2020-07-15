import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';

import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersReporsitory')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Customer not found');
    }

    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length) {
      throw new AppError('No products found with the given IDs.');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id),
    );

    if (checkInexistentProducts) {
      throw new AppError(
        `Could not find product ${checkInexistentProducts[0].id}`,
      );
    }

    const findProductsWithQuantityNotAvailable = products.filter(
      product =>
        existentProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithQuantityNotAvailable.length) {
      throw new AppError(
        `is not available for ${findProductsWithQuantityNotAvailable}`,
      );
    }

    if (!findProductsWithQuantityNotAvailable) {
      throw new AppError('Quantity not available');
    }

    const productsWithPrice = await this.productsRepository.findAllById(
      products.map(product => ({ id: product.id })),
    );

    console.log('customer');
    console.log(customerExists);

    console.log('products');
    console.log(products);

    console.log('productsWithPrice');
    console.log(productsWithPrice);

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProducts.filter(p => p.id === product.id)[0].price,
    }));

    console.log('productsWithPrice');
    console.log(productsWithPrice);

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,

      // products.map(product => ({
      //   product_id: product.id,
      //   price:
      //     productsWithPrice.find(({ id }) => id === product.id)?.price || 0,
      //   quantity: product.quantity,
      // })),
    });

    console.log('order');
    console.log(order);

    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity:
        existentProducts.filter(p => p.id === product.id)[0].quantity -
        product.quantity,
    }));

    console.log('orderedProductsQuantity');
    console.log(orderedProductsQuantity);

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    console.log('order');
    console.log(order);

    return order;
  }
}

export default CreateOrderService;
