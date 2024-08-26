import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, map, of, race, switchMap, throwError } from 'rxjs';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  roleMatch(roles: string[]) {
    throw new Error('Method not implemented.');
  }

  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private presence: PresenceService) { }

  login(model: any, options?: {headers?: any}): Observable<any> {
    return this.http.post<User>(this.baseUrl + "account/login", model, options)
    .pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
        }
      })
    ) ;
  }

  register(model: any) {
      return this.http.post(this.baseUrl + 'account/register', model);
  }

  resendConfirmationEmail(email: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/resendconfirmationemail', {email});
  }

  confirmEmail(userId: string, code: string): Observable<any> {
    return this.http.get(this.baseUrl + 'account/confirmemail', {
      params: { userId, code }
    });
  }

  sendResetPasswordLink(email: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/sendresetpasswordemail', {email});
  }

  resetPassword(model: any): Observable<any> {
    return this.http.post(this.baseUrl + 'account/resetpassword', model);
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('fblst')) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('fblst')) {
        sessionStorage.removeItem(key);
      }
    });
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  getDecodedToken(token) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  // externalLogin(provider: string): Observable<any> {
  //   console.log("Got to external login");
  //   return this.http.get(this.baseUrl + 'account/external-login?provider=' + provider).pipe(
  //     map((response: any) => {
  //       const user = response;
  //       console.log("User Login DATA: " + JSON.stringify(user));
  //       if (user) {
  //         this.setCurrentUser(user);
  //         this.presence.createHubConnection(user);
  //       }
  //     })
  //   );
  // }

  loginWithFacebook(credentials: string): Observable<any> {
    const header = new HttpHeaders().set('Content-Type', 'application/json');
    const loginRequest = this.http.post(this.baseUrl + 'account/loginwithfacebook', JSON.stringify(credentials), {headers: header, withCredentials: true});
    const cancelRequest = new Observable(observer => {
      const popup = window.open(this.baseUrl + 'account/loginwithfacebook', '_blank', 'width=500,height=500');
      
      const handlePopupClose = () => {
        observer.next('Login cancelled');
        observer.complete();
      };
  
      const intervalId = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(intervalId);
          handlePopupClose();
        }
      }, 1000);
  
      popup?.addEventListener('beforeunload', handlePopupClose);
    });
  
    return race([loginRequest, cancelRequest]).pipe(
      switchMap(response => {
        if (response === 'Login cancelled') {
          return throwError('Login cancelled');
        } else {
          const user = response;
          if (user) {
            this.setCurrentUser(user as User);
            this.presence.createHubConnection(user);
          }
          return of(user);
        }
      })
    );
  }

  loginWithGoogle(credentials: string): Observable<any> {
    const header = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.baseUrl + 'account/loginwithgoogle', JSON.stringify(credentials), {headers: header, withCredentials: true}).pipe(
          map((response: any) => {
            const user = response;
            console.log("User GoogleLogin DATA: " + JSON.stringify(user));
            if (user) {
              this.setCurrentUser(user);
              this.presence.createHubConnection(user);
            }
          })
        );
  }
}
