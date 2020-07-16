import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
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
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exist');
    }

    const productsIds = products.map(product => ({ id: product.id }));

    const findProductsById = await this.productsRepository.findAllById(
      productsIds,
    );

    if (findProductsById.length < products.length) {
      throw new AppError('One or more products are missing');
    }

    const updatedQuantities: IUpdateProductsQuantityDTO[] = [];

    const parsedProduts = findProductsById.map(product => {
      const findUpdatedProduct = products.find(
        updatedProduct => updatedProduct.id === product.id,
      );

      if (!findUpdatedProduct) {
        throw new AppError('One or more products are missing');
      }

      if (product.quantity < findUpdatedProduct.quantity) {
        throw new AppError('Insufficient quantity');
      }

      updatedQuantities.push({
        id: findUpdatedProduct.id,
        quantity: product.quantity - findUpdatedProduct.quantity,
      });

      return {
        product_id: product.id,
        price: product.price,
        quantity: findUpdatedProduct?.quantity || 0,
      };
    });

    await this.productsRepository.updateQuantity(updatedQuantities);

    const order = await this.ordersRepository.create({
      customer,
      products: parsedProduts,
    });

    return order;
  }
}

export default CreateOrderService;
