import { IsString, IsNotEmpty } from 'class-validator';

export class ChatbotRequestDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}