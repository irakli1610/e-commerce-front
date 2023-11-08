import { Component } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-card-status',
  templateUrl: './card-status.component.html',
  styleUrls: ['./card-status.component.css']
})
export class CardStatusComponent {
  totalPrice: number = 0.00;
  totalQuantity: number = 0;


  constructor(private cartService: CartService){

  }

  ngOnInit(): void {
    this.updateCartStatus();
  }
  updateCartStatus() {
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data
      }
    );

    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data
      }
    );
  }
}
