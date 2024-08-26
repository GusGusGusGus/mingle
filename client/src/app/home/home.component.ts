import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';
import { environment } from 'src/environments/environment';

declare const FB: any;
declare var google: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  registerMode: boolean = false;
  resetPasswordMode: boolean = false;
  public googleClientId = environment.googleClientId;


  constructor(private route: ActivatedRoute,
      private toastr: ToastrService,
      private accountService: AccountService,
      private router: Router,
      private ngZone: NgZone,
  ) {
  }
  
  ngOnInit(): void {     
    this.route.queryParams.subscribe(params => {       
      if (params['emailConfirmed'] === 'true') {         
        this.toastr.toastrConfig.positionClass = 'toast-bottom-center';         
        this.toastr.success("<p><strong>Email confirmed. </strong></p> <p>You can now login.</p>", 'Success 🥳');       
      }     
    });      
    this.initializeGoogleButton();
    this.loadFacebookSDK();


  }    

  // private loadGoogleButtonLibrary(): void {
  //   const script = document.createElement('script');
  //   script.src = 'https://accounts.google.com/gsi/client';
  //   script.async = true;
  //   script.defer = true;
  //   document.body.appendChild(script);

  //   script.onload = () => {
  //     // The script has loaded, now we can use the Google Sign-In API
  //     this.initializeGoogleButton();
  //   };
  // }

  private loadFacebookSDK(): void {
    (window as any).fbAsyncInit = function() {
      FB.init({
        appId      : '693421629546834',
        cookie     : true,
        xfbml      : true,
        version    : 'v10.0'
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  private initializeGoogleButton(): void {    
    if (typeof google !== 'undefined' && google.accounts){
      // @ts-ignore      
      window.onload = () => {       
        // @ts-ignore       
        google.accounts.id.initialize({         
          client_id: this.googleClientId,          
          callback: this.handleCredentialResponse.bind(this),         
          auto_select: false,         
          cancel_on_tap_outside: true,
          prompt_parent_id: 'google-login-button',
          context: 'use',
            
        });       
        // @ts-ignore       
        google.accounts.id.renderButton(         
          document.getElementById('google-login-button'),         
          { theme: 'outline', size: 'large' }       
        );       
        // @ts-ignore       
        google.accounts.id.prompt();
      };          
    }    
    else {
      
      console.error('Google library not loaded');
      
    }
  }
    

  
 async handleCredentialResponse(response: any) {
    if (response.credential) {
      await this.accountService.loginWithGoogle(response.credential).subscribe({
        next: (user: any) => {
          this.ngZone.run(() => {
            this.toastr.toastrConfig.timeOut = 5000;
            this.toastr.toastrConfig.extendedTimeOut = 5000;
            this.toastr.toastrConfig.positionClass = 'toast-bottom-center';
            this.toastr.success("<p><strong>Login successful</strong></p>", 'Success 🥳');
            this.router.navigateByUrl('members');
          });
        },
        error: (error: any) => this.toastr.error("Google login error: " + error.error)
      });
    }
  }

  registerToggle() {
    this.registerMode = !this.registerMode;
  }
  
  
  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }
  
  cancelResetPasswordMode(event: boolean) {
    this.resetPasswordMode = event;
  }

 
  
  async handleFacebookLogin() {
    // debugger;
    FB.login( async (result: any) => {
      if (result.status === 'connected') {
        
        this.accountService.loginWithFacebook(result.authResponse.accessToken).subscribe({
          next: (x: any) => {
       
            this.toastr.toastrConfig.timeOut = 5000;
            this.toastr.toastrConfig.extendedTimeOut = 5000;
            this.toastr.toastrConfig.positionClass = 'toast-bottom-center';
            this.toastr.success("<p><strong>Login successful</strong></p>", 'Success 🥳');
            this.router.navigateByUrl('members');
  
          },
          error: (error: any) => this.toastr.error("FB login error: "+ error.error)
        });
      }
      else {
        console.log("Facebook login was cancelled or not authorized. Error: " + JSON.stringify(result));
      }
    }, {scope: 'email,public_profile'});
    
  }
  
  ngOnDestroy(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.cancel();
    }
  }
  

  


}
