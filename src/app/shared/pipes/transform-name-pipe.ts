import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformName'
})
export class TransformNamePipe implements PipeTransform {

  transform(value: string | undefined): string {
    if (!value) {
      return '';
    }

    let result:string;

    result=value.replaceAll(" ", "")
    return result.toLowerCase()
  }

}
