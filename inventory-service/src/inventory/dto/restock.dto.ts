import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RestockDto {
  @IsInt()
  @Min(1)
  quantity: number;

  // 'add' = cộng thêm vào tồn kho hiện tại (mặc định)
  // 'set' = đặt lại về con số cụ thể
  @IsOptional()
  @IsString()
  @IsIn(['add', 'set'])
  operation?: 'add' | 'set';
}
