import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class PasswordPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {

        if (typeof value !== 'string') {
            throw new BadRequestException('비밀번호는 문자열이어야 합니다.');
        }

        if (value.length < 8) {
            throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
        }

        return value.toString();
    }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
    constructor(private readonly length: number,
        private readonly subject: string,
    ) {}

    transform(value: any, metadata: ArgumentMetadata) {

        if (typeof value !== 'string') {
            throw new BadRequestException(`${this.subject}는 문자열이어야 합니다.`);
        }
        
        if (value.toString().length > this.length) {
            throw new BadRequestException(`${this.subject}의 최대 길이는 ${this.length} 입니다.`);
        }

        return value.toString();
    }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
    constructor(private readonly length: number,
        private readonly subject: string,
    ) {}

    transform(value: any, metadata: ArgumentMetadata) {

        if (typeof value !== 'string') {
            throw new BadRequestException(`${this.subject}는 문자열이어야 합니다.`);
        }
        
        if (value.toString().length < this.length) {
            throw new BadRequestException(`${this.subject}의 최소 길이는 ${this.length} 입니다.`);
        }

        return value.toString();
    }
}