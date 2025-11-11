import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router'; // Agregar esta importación

import { StripeCheckoutComponent } from './stripe-checkout.component';

describe('StripeCheckoutComponent', () => {
  let component: StripeCheckoutComponent;
  let fixture: ComponentFixture<StripeCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCheckoutComponent, HttpClientTestingModule],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              queryParamMap: {
                get: (key: string) => {
                  const params: any = {
                    clientSecret: 'test_client_secret_123',
                    paymentIntentId: 'pi_test_123',
                    orderId: '1'
                  };
                  return params[key] || null;
                }
              }
            } 
          } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});