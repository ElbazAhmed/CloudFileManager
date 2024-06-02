import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytes',
  standalone: true
})
export class BytesPipe implements PipeTransform {
  transform(value: number | null, precision: number = 2): string {
    if (value === null) {
      return '0 bytes';
    }

    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let parsedValue = value;
    let unitIndex = 0;

    while (parsedValue >= 1024 && unitIndex < units.length - 1) {
      parsedValue /= 1024;
      unitIndex++;
    }

    return `${parsedValue.toFixed(precision)} ${units[unitIndex]}`;
  }
}