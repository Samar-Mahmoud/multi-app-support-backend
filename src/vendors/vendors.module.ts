import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendor, VendorSchema } from './vendors.schema';
import { Category, CategorySchema } from '../categories/categories.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    ProductsModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
