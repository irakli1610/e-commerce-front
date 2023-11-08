import { Component, Inject } from '@angular/core';
import { inject } from '@angular/core/testing';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaSignIn } from '@okta/okta-signin-widget';
import myAppConfig from 'src/app/config/my-app-config';
import { OktaAuthStateService } from '@okta/okta-angular';

import { OnInit } from '@angular/core';







@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  oktaSignIn: any;

  constructor(private oktaAuthService: OktaAuthStateService,@Inject(OKTA_AUTH)private oktaAuth: OktaAuth){
    this.oktaSignIn = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: myAppConfig.oidc.issuer.split('/oath2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      
      authParams:{
        pkce:true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    });
  }


  ngOnInit(): void{
    this.oktaSignIn.remove();

    this.oktaSignIn.renderEl({
      el: '#okta-sign-in-widget'},
      (response: any)=>{
        if(response.status ==='SUCCESS'){
          this.oktaAuth.signInWithRedirect();
          
        }
      },
      (error: any)=>{
        console.log(error);
        throw error;   
      }
    );
  }
}
