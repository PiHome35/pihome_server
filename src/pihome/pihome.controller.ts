import { Body, Controller, Post, Req } from '@nestjs/common';
import { PihomeService } from './pihome.service';
import { CreateFamilyRequestDto, CreateFamilyResponseDto } from './dto/create-family.dto';
import { ApiBody } from '@nestjs/swagger';
import { UserContext } from 'src/auth/interfaces/context.interface';

@Controller('pihome')
export class PihomeController {
  constructor(private readonly pihomeService: PihomeService) {}

  @Post('/family')
  @ApiBody({ type: CreateFamilyRequestDto })
  async createFamily(
    @Req() req: any,
    @Body() createFamilyDto: CreateFamilyRequestDto,
  ): Promise<CreateFamilyResponseDto> {
    const currentUser = req.user as UserContext;
    return this.pihomeService.createFamily(currentUser.id, createFamilyDto);
  }
}
