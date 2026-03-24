import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

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
}
