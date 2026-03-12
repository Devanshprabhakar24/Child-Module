import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  childName?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}

