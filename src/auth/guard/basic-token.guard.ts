import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "../auth.service";

/**
 * 1) 요청 객체 (request) 를 불러오고 authorization header 로부터 토큰을 추출하는 방법
 * 2) authService.extractTokenFromHeader 를 이용해서 사용할 수 있는 형태의 토큰을 추출한다.
 * 3) authService.decodeBasicToken 을 실행해서 email 과 password 를 추출한다.
 * 4) email 과 password 를 이용해서 사용자를 가져온다.
 *    authService.authenticateWithEmailAndPassword
 * 5) 찾아낸 사용자를  1) 요청 객체에 붙여준다.
 *    req.user = user;
 */
@Injectable()
export class BasicTokenGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const rawToken = req.headers['authorization'];
        if (!rawToken) {
            throw new UnauthorizedException('토큰이 없습니다.');
        }
        
        const token = this.authService.extractTokenFromHeader(rawToken, false);
        const credientials = this.authService.decodeBasicToken(token);
        const user = await this.authService.authenticateWithEmailAndPassword(credientials);

        req.user = user;
        
        return true;
    }

}