import { ValidationArguments } from "class-validator";

export const stringValidationMessage = (args: ValidationArguments) => {
    return `${args.property}는 문자열이어야 합니다. 현재 입력된 값: ${args.value}`;
}