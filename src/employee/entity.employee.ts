import { Entity,PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Employee{

    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    position: string

    @Column({ nullable: true })
    dept: string

    @Column({ nullable: true })
    email: string

    @Column({ nullable: true })
    password: string
}
