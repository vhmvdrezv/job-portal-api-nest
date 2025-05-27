import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { AuthService } from "../auth.service";
import { User } from "@prisma/client";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(
        private readonly authService: AuthService
    ) {
        super({ usernameField: 'email' })
    }

    async validate(email: string, password: string): Promise<User> {
        const user = await this.authService.validate(email, password);
        if (!user) throw new UnauthorizedException('Your email or passsword is wrong');
        return user;
    }
}