import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    // TODO
    const order = this.ormRepository.create({
      customer,
      order_products: products,
    });

    await this.ormRepository.save(order);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    // TODO
    const order = await this.ormRepository.findOne(id, {
      relations: ['order_products', 'customer'],
    });

    return order;
  }
}

export default OrdersRepository;

// Expected: ObjectContaining

// {"customer":
//   {
//     "email": "oi@rocketseat.com.br",
//     "id": "c4e6e778-a0f2-4c32-a495-f899ca25c217",
//     "name": "Rocketseat"
//   },
//   "order_products": [
//       {
//         "price": "500.00",
//         "product_id": "c121ddde-95f2-4ab1-8894-270a54d8a385",
//         "quantity": 5
//       }
//     ]
// }

// Received:

// { ****"created_at": "2020-07-15T09:17:14.082Z",
//   "customer":
//     {
//       ****"created_at": "2020-07-15T09:17:14.052Z",
//       "email": "oi@rocketseat.com.br",
//       "id": "c4e6e778-a0f2-4c32-a495-f899ca25c217",
//       "name": "Rocketseat",
//       ****"updated_at": "2020-07-15T09:17:14.052Z"
//     },
//     ****"id": "7f1ee68b-ef23-4f44-9077-eb2a2a3a7241",
//     "order_products": [{
//       ****"created_at": "2020-07-15T09:17:14.082Z",
//       ****"id": "7ff043be-0b0d-4483-bf5d-f48d5ec76750",
//       ****"order_id": "7f1ee68b-ef23-4f44-9077-eb2a2a3a7241",
//       "price": "500",
//       "product_id": "c121ddde-95f2-4ab1-8894-270a54d8a385",
//       "quantity": 5,
//       ****"updated_at": "2020-07-15T09:17:14.082Z"
//     }],
//     ****"updated_at": "2020-07-15T09:17:14.082Z"
//   }
