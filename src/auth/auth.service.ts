import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { Payload } from '../types/payload';
import { UserService } from '../shared/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signPayload(payload: Payload) {
    return sign(payload, 'secretKey', { expiresIn: '12h' });
  }
  async validateUser(payload: Payload) {
    return await this.userService.findByPayload(payload);
  }
}
