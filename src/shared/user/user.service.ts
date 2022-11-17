import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDTO, RegisterDTO } from '../../auth/auth.dto';
import { User } from '../../types/user';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}
  sanitizeUser(user: User) {
    const sanitized = user.toObject();
    delete sanitized['password'];
    return sanitized;
  }
  create = async (userDto: RegisterDTO) => {
    const { username } = userDto;
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const createUser = new this.userModel(userDto);
    await createUser.save();
    return this.sanitizeUser(createUser);
  };

  findByLogin = async (userDto: LoginDTO) => {
    const { username, password } = userDto;
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  };

  findByPayload = async (payload: any) => {
    const { username } = payload;
    return await this.userModel.findOne({ username });
  };
  findAll = async () => {
    await this.userModel.find();
  };
}
