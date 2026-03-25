import { PostsModel } from "src/posts/entities/posts.entity";
import { Column, Entity, OneToMany} from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { BaseModel } from "src/common/entities/base.entity";
import { IsEmail, IsString, Length, ValidationArguments } from "class-validator";
import { lengthValidationMessage } from "src/common/validation-message/length-validation.message";
import { stringValidationMessage } from "src/common/validation-message/string-validation.message";
import { emailValidationMessage } from "src/common/validation-message/email-validation.message";

@Entity('users')
export class UsersModel extends BaseModel {

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

    @Column({
        unique: true,
    })
    @IsString({
        message: stringValidationMessage,
    })
    @IsEmail({}, {
        message: emailValidationMessage,
    })
    email: string;

    @Column({
        length: 20,
        unique: true,
    })
    @IsString({
        message: stringValidationMessage,
    })
    @Length(2, 20, {
        message: lengthValidationMessage,
    })
    nickname: string;

    @Column()
    @IsString({
        message: stringValidationMessage,
    })
    @Length(8, 20, {
        message: lengthValidationMessage,
    })
    password: string;

    @Column({
        type: 'enum',
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;
}
