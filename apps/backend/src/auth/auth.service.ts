import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor() {}

  async register(dto: RegisterUserDto) {
    throw new Error('Not implemented');
  }
}
