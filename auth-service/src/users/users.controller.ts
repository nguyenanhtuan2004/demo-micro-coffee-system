import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

// Guard đơn giản tại service level — defense in depth
function requireAdmin(role: string) {
  if (role !== 'admin') {
    throw new ForbiddenException('Chỉ admin được quản lý nhân sự');
  }
}

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll(@Headers('x-user-role') role: string) {
    requireAdmin(role);
    return this.users.findAll();
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(
    @Body() dto: CreateUserDto,
    @Headers('x-user-role') role: string,
  ) {
    requireAdmin(role);
    return this.users.create(dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') requesterId: string,
    @Headers('x-user-role') role: string,
  ) {
    requireAdmin(role);
    // Không cho phép tự xóa chính mình
    if (id === requesterId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (user.role === 'admin') {
      throw new ForbiddenException('Không thể xóa tài khoản admin');
    }
    return this.users.remove(id);
  }
}
