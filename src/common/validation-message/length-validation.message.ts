import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments) => {
    /**
    * ValidationArguments 의 Properties
    * 
    * 1) value -> 검증되고 있는 값 (입력값)
    * 2) constraints -> 파라미터에서 입력된 제한 사항들
    * 3) targetName -> 검증되고 있는 값이 속한 객체의 클래스 이름
    * 4) property -> 검증되고 있는 값이 속한 객체의 프로퍼티 이름
    * 5) object -> 검증되고 있는 값이 속한 객체 자체
    */
    if (args.constraints.length === 2) {
        return `${args.property}는 최소 ${args.constraints[0]}자 이상 최대 ${args.constraints[1]}자 이하로 입력해주세요.`;
    } else {
        return `${args.property}는 최소 ${args.constraints[0]}자 이상으로 입력해주세요.`;
    }
}