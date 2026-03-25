import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('posts')
export class PostsModel extends BaseModel{

    @ManyToOne(() => UsersModel, (user) => user.posts, {
        nullable: false,
    })
    author: UsersModel;

    @IsString({
        message: stringValidationMessage,
    })
    @Column()
    title: string;

    @IsString({
        message: stringValidationMessage,
    })
    @Column()
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
}