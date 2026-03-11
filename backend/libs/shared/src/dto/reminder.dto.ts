import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ReminderChannel } from '../enums/reminder.enum';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  registrationId!: string;

  @IsString()
  @IsNotEmpty()
  milestoneId!: string;

  @IsEnum(ReminderChannel, { each: true })
  @IsNotEmpty()
  channels!: ReminderChannel[];

  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsEnum(ReminderChannel, { each: true })
  channels?: ReminderChannel[];

  @IsOptional()
  @IsString()
  customMessage?: string;
}
