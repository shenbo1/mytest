import { Injectable } from '@nestjs/common';
import { LoginDto } from '@/modules/auth//dto/login.dto';
import { DatabaseService } from '@/db/database.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.db.user.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('email error');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('password error');
    }
    const payload = {
      sub: user.id,
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    return { token, ...payload };
  }
}
