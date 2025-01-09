import { Module } from '@nestjs/common';
import { PihomeController } from './pihome.controller';
import { PihomeService } from './pihome.service';
import { FamiliesModule } from 'src/families/families.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PihomeController],
  providers: [PihomeService],
  imports: [FamiliesModule, UsersModule],
})
export class PihomeModule {}
