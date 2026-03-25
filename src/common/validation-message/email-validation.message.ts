import { ValidationArguments } from "class-validator";

export const emailValidationMessage = (args: ValidationArguments) => {
    return `${args.property}는 유효한 이메일 형식이어야 합니다. 현재 입력된 값: ${args.value}`;
}