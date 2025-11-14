import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { UserService } from './user.service';
import { IUserQueryParams } from './dto/filter';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UserAvatarResponseDto } from './dto/user-avatar-response.dto';

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

  @Patch(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Atualiza o avatar de um usuário' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserAvatarResponseDto })
  updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
  ): Promise<UserAvatarResponseDto> {
    return this.userService.updateAvatar(+id, req.user, file);
  }
}
