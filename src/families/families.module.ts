import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesService } from './families.service';
import { Family, FamilySchema } from './schemas/family.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Family.name, schema: FamilySchema }])],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
