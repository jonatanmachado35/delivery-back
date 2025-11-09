import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { UserService } from './user.service';
import { IUserQueryParams } from './dto/filter';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserStatusDto } from './dto/update-status.dto';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async paginate(@Query() filters: IUserQueryParams) {
    return this.userService.paginate(
      filters,
      +Math.max(Number(filters.page) || 1, 1),
      +Math.max(Number(filters.limit) || 100, 1),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<void> {
    await this.userService.updateStatus(+id, body);
  }
}
