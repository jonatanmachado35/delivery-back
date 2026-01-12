import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateUserStatusDto } from '../user/dto/update-status.dto';
import { AdminGuard } from '../admin/admin.guard';

@Controller('company')
@ApiTags('Company')
export class CompanyController {
  constructor(private companyService: CompanyService) { }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Atualiza o status da empresa' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<void> {
    await this.companyService.updateStatus(Number(id), body);
  }
}
