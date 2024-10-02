import { PipeTransform, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

/*
 * transformation pipe to transform a string value into ObjectId
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    return new Types.ObjectId(value);
  }
}
