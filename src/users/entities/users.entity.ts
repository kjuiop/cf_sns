import { PostsModel } from "src/posts/entities/posts.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { BaseModel } from "src/common/entities/base.entity";

@Entity('users')
export class UsersModel extends BaseModel {

    @OneToMany(() => PostsModel, (post) => post.author)
    posts: PostsModel[];

    @Column({
        unique: true,
    })
    email: string;

    @Column({
        length: 20,
        unique: true,
    })
    nickname: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: Object.values(RolesEnum),
        default: RolesEnum.USER,
    })
    role: RolesEnum;
}
