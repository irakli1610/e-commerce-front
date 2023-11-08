import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  checkoutFormGroup !: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];


  countries: Country[]=[];


  shippingAdressStates: State[]=[];
  billingAdressStates: State[]=[];

   storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder,
    private luv2shopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) {

  }

  ngOnInit(): void {



    this.reviewCartDetails();

    const theEmail = JSON.parse(this.storage.getItem('userEmail'));
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail,
                                  [Validators.required, 
                                  Validators.pattern('^[a-z0-9._%+-]+@[a-z09.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAdress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAdress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        country: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace])
      
      }),
      creditCardInformation: this.formBuilder.group({
        cardType: new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('',[Validators.required, Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',[Validators.pattern('[0-9]{16}'),Validators.required]),
        securityCode: new FormControl('',[Validators.pattern('[0-9]{3}'),Validators.required]),
        expirationMonth: [''],
        expirationYear: ['']

      }),
    });

    //populate credit card month
    const startMonth: number = new Date().getMonth() + 1;

    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths =data;
      }
    )

    //populate credit card year

    this.luv2shopFormService.getCreditCardYear().subscribe(
      data =>{
        this.creditCardYears =data;
      }
    )

    this.luv2shopFormService.getCountries().subscribe(
      data => {
        this.countries =data;

      }
    )

  }


 

  onSubmit() {

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;


    const cartItems = this.cartService.cartItems;
    let ordetItems:OrderItem[]=cartItems.map(tempCartItem => new OrderItem(tempCartItem));


    let purchase = new Purchase();

    purchase.customer=this.checkoutFormGroup.controls['customer'].value;


    purchase.shippingAddress =this.checkoutFormGroup.controls['shippingAdress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;


    purchase.billingAddress =this.checkoutFormGroup.controls['billingAdress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;

    purchase.order = order;
    purchase.orderItems=ordetItems;


    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response=>{
          alert(`Your order has been received.\nOrder Tracking number: ${response.orderTrackingNumber}`)

          // reset cart

          this.resetCart();
        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );
  }


 


  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}
 
  get shippingAdressStreet(){return this.checkoutFormGroup.get('shippingAdress.street');}
  get shippingAdressCity(){return this.checkoutFormGroup.get('shippingAdress.city');}
  get shippingAdressState(){return this.checkoutFormGroup.get('shippingAdress.state');}
  get shippingAdressCountry(){return this.checkoutFormGroup.get('shippingAdress.country');}
  get shippingAdressZipCode(){return this.checkoutFormGroup.get('shippingAdress.zipCode');}

  get billingAdressStreet(){return this.checkoutFormGroup.get('billingAdress.street');}
  get billingAdressCity(){return this.checkoutFormGroup.get('billingAdress.city');}
  get billingAdressState(){return this.checkoutFormGroup.get('billingAdress.state');}
  get billingAdressCountry(){return this.checkoutFormGroup.get('billingAdress.country');}
  get billingAdressZipCode(){return this.checkoutFormGroup.get('billingAdress.zipCode');}


  get cardType(){return this.checkoutFormGroup.get('creditCardInformation.cardType');}
  get nameOnCard(){return this.checkoutFormGroup.get('creditCardInformation.nameOnCard');}
  get cardNumber(){return this.checkoutFormGroup.get('creditCardInformation.cardNumber');}
  get securityCode(){return this.checkoutFormGroup.get('creditCardInformation.securityCode');}
 


  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice=totalPrice
    );

    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity=totalQuantity
    );
  }

  copyShippingAdressToBillingAdress(event: Event) {
    if ((<HTMLInputElement>event.target!).checked) {
      this.checkoutFormGroup.controls['billingAdress'].setValue(
        this.checkoutFormGroup.controls['shippingAdress'].value);

        this.billingAdressStates=this.shippingAdressStates;
    } else {
      this.checkoutFormGroup.controls['billingAdress'].reset();
      this.billingAdressStates = [];
    }
  }

  handleMonthsAndYears(){
    const creditCartFormGroup = this.checkoutFormGroup.get('creditCardInformation');

    const currentYear: number = new Date().getFullYear();
    const selectedyear: number = Number(creditCartFormGroup?.value.expirationYear);

    let startMonth:number;

    if(currentYear===selectedyear){
      startMonth=new Date().getMonth()+1;
    }else{
      startMonth=1;
    }
    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        this.creditCardMonths =data;
      }
    ) 


  }

  getStates(formGroupName: string){

    
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    

    const countryCode = formGroup!.value.country.code;
    

    this.luv2shopFormService.getStates(countryCode).subscribe(
      data => {
        if( formGroupName ==='shippingAdress'){
          this.shippingAdressStates=data;
          
        }else{
          this.billingAdressStates=data;
        }

        formGroup!.get('state')!.setValue(data[0])
      }
    );
  }

  resetCart() {
    this.cartService.cartItems =[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products")
  }
}
