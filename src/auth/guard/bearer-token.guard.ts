import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class BearerTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];
        if (!rawToken) {
            throw new UnauthorizedException('토큰이 없습니다.');
        }

        const token = this.authService.extractTokenFromHeader(rawToken, true);
        const payload = await this.authService.verifyToken(token);

        /**
         * request 에 넣을 정보
         * 
         * 1) 사용자 정보 - user
         * 2) token 의 type - tokenType
         * 3) token 자체 - token
         */
        const user = await this.userService.getUserByEmail(payload.email);

        req.user = user;
        req.token = token;
        req.tokenType = payload.type;
        
        return true;
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();

        if (req.tokenType !== 'access') {
            throw new UnauthorizedException('액세스 토큰이 필요합니다.');
        }

        return true;
    }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();

        if (req.tokenType !== 'refresh') {
            throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
        }

        return true;
    }
}