import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';

/** 
     * 1) registerWithEmail
     *    - email, nickname, password
     *    - response : accessToken, refreshToken
     *    - 회원가입하면 바로 로그인 됨
     * 
     * 2) loginWithEmail
     *   - email, password
     *   - response : accessToken, refreshToken
     * 
     * 3) loginUser
     *   - 1), 2) 에 필요한 acceessToken 과 refreshToken 을 반환하는 로직
     * 
     * 4) signToken
     *   - 3) 에서 필요한 accessToken 과 refreshToken 을 sign 하는 로직
     * 
     * 5) authenticateWithEmailAndPassword
     *   - 2) 에서 로그인을 진행할 때 필요한 기본적인 검증 진행
     *     1. 사용자가 존재하는지 확인(emial)
     *     2. password 가 일치하는지 확인
     *     3. 모두 통과되면 찾은 사용자 정보 반환
     *     4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
     */

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UsersService,
    ) {}

    /**
     * 토큰을 사용하게 되는 방식
     * 
     * 1) 사용자가 로그인 또는 회원가입을 진행하면 accessToken 과 refreshToken 을 발급
     * 2) 로그인 할 때는 Basic 토큰과 함께 요청을 보낸다.
     *    Basic 토큰은 이메일:비밀번호 를 Base64 로 인코딩한 형태이다.
     *    bearer 토큰은 Authorization: Bearer accessToken 형태로 Header 에 담아서 보낸다.
     * 3) 아무나 접근할 수 없는 정보 (private route) 를 접근할 때는 accessToken 을 Header 에 추가해서 요청과 함께 보낸다.
     * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
     *    토큰의 sub 값에 입력되어있는 id 값을 통해서 사용자를 식별할 수 있다.
     * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면 새로 토큰을 받아야 한다.
     *    그렇지 않으면 jwtService.verify() 에서 인증이 통과되지 않는다.
     * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청해서 새로 토큰을 발급 받는다.
     */

    /**
     * payload 에 들어갈 정보
     * 1) email
     * 2) sub -> id
     * 3) type : 'access' | 'refresh'
     */
    signToken(user: Pick<UsersModel, 'id' | 'email'>, isRefreshToken: boolean) {
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        };

        return this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            // seconds
            expiresIn: isRefreshToken ? 3600 : 300,
        })

    }

    loginUser(user: Pick<UsersModel, 'id' | 'email'>) {
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
        /**
         * 1. 사용자가 존재하는지 확인(email)
         * 2. password 가 일치하는지 확인
         * 3. 모두 통과되면 찾은 사용자 정보 반환
         * 4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
         */

        const existingUser = await this.userService.getUserByEmail(user.email);
        if (!existingUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
        }

        const isPasswordValid = await bcrypt.compare(user.password, existingUser.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        return existingUser;
    }

    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
        const existingUser = await this.authenticateWithEmailAndPassword(user);
        return this.loginUser(existingUser);
    }

    async registerWithEmail(user: RegisterUserDto) {
        const hash = await bcrypt.hash(
            user.password,
            HASH_ROUNDS, // saltRounds
        );
        
        const newUser = await this.userService.createUser({
            ...user,
            password: hash,
        });

        return this.loginUser(newUser);
    }

    /**
     * Header 로 부터 토큰을 받을 때
     * authorization : Basic {token}
     * authorization : Bearer {token}
     * 
     * 1) Basic 토큰은 이메일:비밀번호 를 Base64 로 인코딩한 형태이다.
     *    로그인 할 때 사용된다.
     * 2) Bearer 토큰은 accessToken 이 담긴 형태이다.
     *    private route 에 접근할 때 사용된다.
     */
    extractTokenFromHeader(header: string, isBearer: boolean) {
        
        const splitToken = header.split(' ');
        const prefix = isBearer ? 'Bearer' : 'Basic';

        if (splitToken.length !== 2 || splitToken[0] !== prefix) {
            throw new UnauthorizedException('잘못된 토큰 형식입니다.');
        }

        const token = splitToken[1];
        return token;
    }

    decodeBasicToken(token: string) {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const split = decoded.split(':');
        if (split.length !== 2) {
            throw new UnauthorizedException('잘못된 Basic 토큰입니다.');
        }

        const [email, password] = split;
        return { email, password };
    }

    verifyToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                secret: JWT_SECRET,
            });
        } catch (e) {
            throw new UnauthorizedException('토큰이 만료되었거나 유효하지 않습니다.');
        }
    }

    rotateToken(token: string, isRefreshToken: boolean) {
        const decoded = this.jwtService.verify(token, {
            secret: JWT_SECRET,
        });

        if (decoded.type !== 'refresh') { 
            throw new UnauthorizedException('토큰 재발급은 Refresh 토큰으로만 가능합니다.');
        }

        return this.signToken({
            ...decoded,
        }, isRefreshToken)
    }
}
