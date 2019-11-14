import { Component } from '@angular/core';
import { Platform, 
  NavController,
   NavParams,
    ModalController, 
  ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { AnalyticsService } from '../../../providers/analytics-service';
import { SignUpService } from '../../../providers/sign-up-service';

import { Terms } from '../terms/terms';
import { Policy } from '../policy/policy';
import { Success } from '../success/success';
import * as utils from '../../../utils/utils';

@Component({
  selector: 'page-free-business-account',
  templateUrl: 'free-business-account.html'
})
export class FreeBusinessAccount {
  form: FormGroup;
  terms: boolean = false;
  policy: boolean = false;
  loader: any;
  errors: string[]= [];
  serverErrors: string[] = [];
  public user_form_step_first = true;
  public user_form_step_second = true;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public translateService: TranslateService,
    private analyticsService: AnalyticsService,
    private signUpService: SignUpService
  ) {
    this.initForm();

    let general_data = {
      'event':'page',
      'p_path':'/free-business-account',
      'p_title':'Free Signup for B2B'
    };
    this.analyticsService.trackCustomEvent(general_data);
  }

  ionViewDidLoad() {
    let data = {
      'title':'Free Business Account',
      'url':'free-business-account'
    };
    let user_data = {
      'uid': null
    };
    //this.analyticsService.trackPageView(data);
  }

  initForm() {
    let self = this;
    this.form = this.formBuilder.group({
      emails: this.formBuilder.group(
        {
          email: [
            '',
            [
              Validators.required,
              Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ]
          ],
          emailConfirmation: [
            null,
            Validators.required
          ]
        },
        { validator: self.matching('email', 'emailConfirmation') }
      ),
      passwords: this.formBuilder.group(
        {
          password:
          [
            null,
            [
              Validators.required
            ]
          ],
          passwordConfirmation: [
            null,
            [
              Validators.required
            ]
          ]
        },
        { validator: self.matching('password', 'passwordConfirmation') }
      ),
      phone: [
        null,
        Validators.required
      ],
      company: [
        null,
        Validators.required
      ],
      legal: [
        null,
        Validators.required
      ]
    });
  }

  checkUserForm(step) {
    if (step == 1 && this.user_form_step_first) {
      let data = this.analytic_structure(step);
      this.analyticsService.trackCustomEvent(data);
      this.user_form_step_first = false;
    }

    if (step == 2 && this.user_form_step_second) {
      let data = this.analytic_structure(step);
      this.analyticsService.trackCustomEvent(data);
      this.user_form_step_second = false;
    }

  }

  private analytic_structure(step) {
    return {
      "event": "checkout",
      "ecommerce": {
        "checkout": {
          'actionField': {'step': step},
          'products': [{
            "id": "demob2b",
            "name": "demob2b",
            "price": "0",
            "variant": "full",
            "quantity": 1
          }]
        }
      }
    };
  }

  onSubmit(event: FormGroup) {
    this.errors = [];

    if(this.form.valid) {
      if(this.form.value.legal) {
        this.presentLoading();
        
        this.signUpService
          .signUpFreeBusinessAccount(this.form.value)
          .subscribe(
            user => {
              this.loader.dismiss();
              // pass in the user to the success page so that we can then
              // store his token.
              this.navCtrl.setRoot(Success, {
                user: user
              });
              this.trackRegistrationData(user);
            },
            error => {
              console.log(error);
              if(error.isArray){
                this.serverErrors = <string[]>error;
              } else {
                this.serverErrors.length = null;
                this.serverErrors.push(<string>error);
              }
              this.loader.dismiss();
            }
          );
      } else {
        this.translateService
          .get('signUp.freeAccount.needToAccept')
          .subscribe(value => utils.presentToast(this.toastCtrl,value));
      }
    } else {

      let emailValid = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(this.form.value.emails.email);

      if (!emailValid) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.emailInvalid'));
      }

      if (!this.terms) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.needToAccept'));
      }

      if (!this.form.value.passwords.password || !this.form.value.passwords.passwordConfirmation) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.pickPassword'));
      }

      if (this.form.value.passwords.password != this.form.value.passwords.passwordConfirmation) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.passwordsDontMatch'));
      }

      if (this.form.value.emails.email != this.form.value.emails.emailConfirmation) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.emailsDontMatch'));
      }

      if (!this.form.value.emails.email || !this.form.value.emails.emailConfirmation) {
        this.errors.push(this.translateService.instant('signUp.freeAccount.errors.pickEmail'));
      }

      let message = '';
      let length = this.errors.length;
      for (let i = 1; i <= length; i++) {
        if (i == length) {
          message += this.errors[i-1];
        } else {
          message += this.errors[i-1] + '\n';
        }
      }
      utils.presentToast(this.toastCtrl,message);
      console.error("invalid form submitted", this.form);
      return true;
    }
  }

  matching(key: string, confirmationKey: string) {
    return (group: FormGroup) => {
      let input = group.controls[key];
      let confirmationInput = group.controls[confirmationKey];
      if (input.value !== confirmationInput.value) {

        return confirmationInput.setErrors({ notEquivalent: true });
      }else {
        return confirmationInput.setErrors(null);
      }
    };
  }

  readTermsAndConditions(event) { 
    event.preventDefault();
    let termsModal = this.modalCtrl.create(Terms);
    termsModal.present();
  }

  readPrivacyPolicy(event) {
    event.preventDefault();
    let policyModal = this.modalCtrl.create(Policy);
    policyModal.present();
  }


  private presentLoading() {
    let spinner = this.platform.is('ios') ? 'ios' : 'crescent';
    let content;
    this.translateService.get('signUp.loading')
      .subscribe(translation => content = translation);

    this.loader = this.loadingCtrl.create({
      spinner: spinner,
      content: content
    });
    this.loader.present();
  }

  private ecommerce_structure(step, type) {
    return {
      "event": "checkout",
      "ecommerce": {
        "checkout": {
          'actionField': {'step': step},
          'products': [{
            "id": type,
            "name": type,
            "price": "0",
            "variant": "full",
            "quantity": 1
          }]
        }
      }
    };
  }

  private trackRegistrationData(user) {
    let general_data = {
      'event':'page',
      'p_path':'/success',
      'p_title':'Success',
      'user': user.id
    };

    let data = this.ecommerce_structure(2, "demob2c");

    if (user.is_company) {
      data = this.ecommerce_structure(2, "demob2b");
      this.analyticsService.trackCustomEvent({'event':'demo b2b'});
    } else {
      this.analyticsService.trackCustomEvent({'event':'demo b2c'});
    }

    this.analyticsService.trackCustomEvent(general_data);
    this.analyticsService.trackCustomEvent(data);
    this.analyticsService.trackCustomEvent({'event': 'demo_created'});

    // remove_it
    // let data = {
    //   title: 'Firma created free account',
    //   url: '/reg/free_business_account_created',
    //   orderid: user.id,
    // };
    // this.analyticsService.trackPageView(data);
  }

  public goBack(event) {
    event.preventDefault();
    this.navCtrl.pop();
  }
}
