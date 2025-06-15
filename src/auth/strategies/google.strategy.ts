import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { UserRole } from "@prisma/client";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || ' ',
            callbackURL: configService.get('GOOGLE_CALLBACK_URL') || '',
            scope: [
                "email",
                "profile",
            ],
            passReqToCallback: true,
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {

        const { name, emails } = profile;
        const role =  UserRole.SEEKER;

        const user = {
            googleId: profile.id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            accessToken,
            refreshToken,
            role,
        }

        const result = await this.authService.googleLogin(user);

        done(null, result)
    }
}