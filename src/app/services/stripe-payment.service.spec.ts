import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { StripePaymentService } from './stripe-payment.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { ExchangeRateService } from './exchange-rate.service';

// Mocks mejorados
class MockPaymentGatewayService {
  createPaymentRequest = jasmine.createSpy('createPaymentRequest').and.returnValue({});
  createPaymentIntent = jasmine.createSpy('createPaymentIntent').and.returnValue({});
  getPaymentStatus = jasmine.createSpy('getPaymentStatus').and.returnValue({});
}

class MockExchangeRateService {
  isAmountWithinStripeLimit = jasmine.createSpy('isAmountWithinStripeLimit').and.returnValue({
    valid: true,
    usdAmount: 10,
    message: ''
  });
}

describe('StripePaymentService', () => {
  let service: StripePaymentService;
  let paymentGatewayService: MockPaymentGatewayService;
  let exchangeRateService: MockExchangeRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StripePaymentService,
        { provide: PaymentGatewayService, useClass: MockPaymentGatewayService },
        { provide: ExchangeRateService, useClass: MockExchangeRateService }
      ]
    });

    service = TestBed.inject(StripePaymentService);
    paymentGatewayService = TestBed.inject(PaymentGatewayService) as unknown as MockPaymentGatewayService;
    exchangeRateService = TestBed.inject(ExchangeRateService) as unknown as MockExchangeRateService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have all required methods', () => {
    expect(service.initializeStripe).toBeDefined();
    expect(service.isStripeReady).toBeDefined();
    expect(service.createStripePaymentIntent).toBeDefined();
    expect(service.checkPaymentStatus).toBeDefined();
    expect(service.checkConfiguration).toBeDefined();
  });

  it('should check configuration without errors', () => {
    const config = service.checkConfiguration();
    
    expect(config).toBeDefined();
    expect(config.valid).toBeDefined();
    expect(config.issues).toBeDefined();
    expect(Array.isArray(config.issues)).toBeTrue();
  });

  it('should have window management methods', () => {
    expect(service.openStripeInNewWindow).toBeDefined();
    expect(service.checkWindowStatus).toBeDefined();
    expect(service.closeStripeWindow).toBeDefined();
  });

  it('should have debug methods', () => {
    expect(service.debugServiceState).toBeDefined();
    
    // Verificar que el método debug se puede llamar sin errores
    expect(() => service.debugServiceState()).not.toThrow();
  });
});