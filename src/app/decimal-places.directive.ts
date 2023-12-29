// decimal-places.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDecimalPlaces]'
})
export class DecimalPlacesDirective {
  @Input('appDecimalPlaces') decimalPlaces: number = 2;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    const regex = new RegExp(`^[0-9]+(\.[0-9]{0,${this.decimalPlaces}})?$`);
    
    if (!regex.test(value)) {
      input.value = value.slice(0, -1);
    }
  }
}
