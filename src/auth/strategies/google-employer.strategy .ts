import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UserRole } from "@prisma/client";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { DatabaseService } from "src/database/database.service";
import { AuthService } from "../auth.service";

@Injectable()

export class GoogleEmployerStrategy extends PassportStrategy(Strategy, 'google-employer') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || ' ',
            callbackURL: 'http://localhost:3000/auth/google/employer-callback',
            scope: [
                "email",
                "profile",
            ],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const { name, emails } = profile;
        const role = UserRole.EMPLOYER;

        const user = {
            googleId: profile.id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            accessToken,
            refreshToken,
            role,
        }

        const result = await this.authService.googleLogin(user)

        done(null, result)
    }
}