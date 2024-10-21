import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Url } from '../url/url.entity';

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ nullable: true })
  userId: number | null;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column()
  hostname: string;

  @ManyToOne(() => Url, { nullable: false })
  @JoinColumn({ name: 'urlId' })
  url: Url;

  @Column()
  urlId: number;

  @Column({ length: 6 })
  shortUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
