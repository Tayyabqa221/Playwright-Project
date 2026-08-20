import dotenv from 'dotenv';
import MailosaurClient from 'mailosaur';
dotenv.config();

export const serverId = process.env.mailosaurServerId;
export const domain = process.env.mailosaurDomain;

export const mailosaur = new MailosaurClient(process.env.mailosaurApiKey!);
