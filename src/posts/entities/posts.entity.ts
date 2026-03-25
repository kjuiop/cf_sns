import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('posts')
export class PostsModel extends BaseModel{

    @ManyToOne(() => UsersModel, (user) => user.posts, {
        nullable: false,
    })
    author: UsersModel;

    @IsString({
        message: 'title 은 string 타입을 입력해줘야 합니다.',
    })
    @Column()
    title: string;

    @IsString({
        message: 'content 는 string 타입을 입력해줘야 합니다.',
    })
    @Column()
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
}